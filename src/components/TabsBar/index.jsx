import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    useSortable,
    horizontalListSortingStrategy,
    rectSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { tabs as defaultTabs } from "../../helpers/tabsInfo.js";

import Tab from "../Tab/index.jsx";

import dropDownBtn from "../../assets/expand_more_FILL0_wght400_GRAD0_opsz24 1.svg"

import styles from './TabsBar.module.css';

const LOCAL_STORAGE_KEY = "tab-order";

function useWindowWidth() {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        function handleResize() {
            setWidth(window.innerWidth);
        }

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return width;
}

function SortableTab({
                         id, icon, name,
                         url, onWidthMeasured, isDropdown,
                         pinned, onTogglePin, isActive
                     }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id, disabled: pinned });

    const [dragging, setDragging] = useState(false);
    const [hovered, setHovered] = useState(false);
    const localRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isDropdown && localRef.current) {
            const width = localRef.current.getBoundingClientRect().width;
            onWidthMeasured(id, width);
        }
    }, [id, onWidthMeasured, isDropdown]);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleMouseDown = () => setDragging(false);
    const handleMouseMove = () => setDragging(true);

    const handleMouseUp = (e) => {
        if (e.target.tagName.toLowerCase() === "button") return;
        if (!dragging) {
            navigate(url);
        }
    };

    return (
        <div
            ref={(node) => {
                setNodeRef(node);
                localRef.current = node;
            }}
            style={style}
            className={styles.sortableTab}
            {...attributes}
            {...listeners}
            {...style}

            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}

            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <Tab
                icon={icon}
                name={name}
                url={url}
                isActive={isActive}
                isDragging={isDragging}
                pinned={pinned} />

            {hovered && onTogglePin && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(id);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className={styles.pinButton}
                >
                    {pinned ? "Unpin" : "Pin"}
                </button>
            )}
        </div>
    );
}

export default function TabsBar() {
    const [orderedTabs, setOrderedTabs] = useState(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        return saved ? JSON.parse(saved)
            : defaultTabs.map((tab, i) => ({
                ...tab,
                id: i.toString(),
                pinned: false,
            }));
    });

    const [tabWidths, setTabWidths] = useState({});
    const width = useWindowWidth();
    const location = useLocation();
    const [activeTabId, setActiveTabId] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleWidthMeasured = useCallback((id, width) => {
        setTabWidths((prev) => {
            if (prev[id] !== width) {
                return { ...prev, [id]: width };
            }
            return prev;
        });
    }, []);

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orderedTabs));
    }, [orderedTabs]);

    useEffect(() => {
        const currentTab = orderedTabs.find(tab => tab.url === location.pathname);
        if (currentTab) {
            setActiveTabId(currentTab.id);
        }
    }, [location.pathname, orderedTabs]);

    const handleDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;

        setOrderedTabs((prevTabs) => {
            const pinned = prevTabs.filter((t) => t.pinned);
            const unpinned = prevTabs.filter((t) => !t.pinned);

            const oldIndexPinned = pinned.findIndex(t => t.id === active.id);
            const newIndexPinned = pinned.findIndex(t => t.id === over.id);

            if (oldIndexPinned !== -1 && newIndexPinned !== -1) {
                const reorderedPinned = arrayMove(pinned, oldIndexPinned, newIndexPinned);
                return [...reorderedPinned, ...unpinned];
            }

            const oldIndexUnpinned = unpinned.findIndex(t => t.id === active.id);
            const newIndexUnpinned = unpinned.findIndex(t => t.id === over.id);

            if (oldIndexUnpinned !== -1 && newIndexUnpinned !== -1) {
                const reorderedUnpinned = arrayMove(unpinned, oldIndexUnpinned, newIndexUnpinned);
                return [...pinned, ...reorderedUnpinned];
            }

            return prevTabs;
        });
    };

    const togglePin = (id) => {
        setOrderedTabs((tabs) => {
            const updatedTabs = tabs.map((tab) =>
                tab.id == id ? { ...tab, pinned: !tab.pinned } : tab
            );

            const pinned = updatedTabs.filter((t) => t.pinned);
            const unpinned = updatedTabs.filter((t) => !t.pinned);

            return [...pinned, ...unpinned];
        });
        setTabWidths({});
    };

    const allTabs = orderedTabs;

    const pinnedTabs = allTabs.filter(t => t.pinned);
    const unpinnedTabs = allTabs.filter(t => !t.pinned);

    function findPinnedThatFit() {
        let sum = 0;
        const fit = [];
        for (let i = 0; i < pinnedTabs.length; i++) {
            const w = tabWidths[pinnedTabs[i].id] || 0;
            if (sum + w <= width - 140) {
                sum += w;
                fit.push(pinnedTabs[i]);
            } else {
                break;
            }
        }
        return fit;
    }

    const pinnedThatFit = findPinnedThatFit();
    const pinnedInDropdown = pinnedTabs.filter(t => !pinnedThatFit.includes(t));
    const pinnedWidthSum = pinnedThatFit.reduce((acc, t) => acc + (tabWidths[t.id] || 0), 0);

    function findUnpinnedThatFit() {
        let sum = pinnedWidthSum;
        const fit = [];
        for (let i = 0; i < unpinnedTabs.length; i++) {
            const w = tabWidths[unpinnedTabs[i].id] || 0;
            if (sum + w <= width - 140) {
                sum += w;
                fit.push(unpinnedTabs[i]);
            } else {
                break;
            }
        }
        return fit;
    }

    const unpinnedThatFit = findUnpinnedThatFit();

    const unpinnedInDropdown = unpinnedTabs.filter(t => !unpinnedThatFit.includes(t));
    const visibleTabs = [...pinnedThatFit, ...unpinnedThatFit];
    const dropdownTabs = [...pinnedInDropdown, ...unpinnedInDropdown];

    const showDropdownButton = dropdownTabs.length > 0;

    return (
        <>
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <div className={styles.tabsContainer}>
                    <SortableContext
                        items={visibleTabs.map(t => t.id)}
                        strategy={horizontalListSortingStrategy}
                    >
                        <div className={styles.tabsList}
                             key={orderedTabs.map(t => t.id + t.pinned).join("-")}
                        >
                            {visibleTabs.map(tab => (
                                <SortableTab
                                    key={tab.id}
                                    {...tab}
                                    onWidthMeasured={handleWidthMeasured}
                                    onTogglePin={togglePin}
                                    isDropdown={false}
                                    isActive={activeTabId === tab.id}
                                />
                            ))}
                        </div>
                    </SortableContext>

                    {showDropdownButton && (
                        <div
                            className={`${styles.dropdownButton} ${dropdownOpen ? styles.dropdownButtonOpen : ''}`}
                            onClick={() => setDropdownOpen(o => !o)}
                            title="Show extra tabs"
                        >
                            <img src={dropDownBtn} alt="Expand" />
                        </div>
                    )}
                </div>

                {dropdownOpen && dropdownTabs.length > 0 && (
                    <SortableContext
                        items={dropdownTabs.map(t => t.id)}
                        strategy={rectSortingStrategy}
                    >
                        <div className={styles.dropdownMenu}>
                            {dropdownTabs.map(tab => (
                                <SortableTab
                                    key={tab.id}
                                    {...tab}
                                    onWidthMeasured={() => { }}
                                    isDropdown={true}
                                    onTogglePin={togglePin}
                                    isActive={activeTabId === tab.id}
                                />
                            ))}
                        </div>
                    </SortableContext>
                )}
            </DndContext>
        </>
    );
}
