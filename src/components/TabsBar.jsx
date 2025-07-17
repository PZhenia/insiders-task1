import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    useSortable,
    horizontalListSortingStrategy,
    rectSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { tabs as defaultTabs } from "../helpers/tabsInfo.js";
import Tab from "./Tab.jsx";
import dropDownBtn from "../assets/expand_more_FILL0_wght400_GRAD0_opsz24 1.svg"

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

function SortableTab({ id, icon, name, url, onWidthMeasured, isDropdown  }) { //перетягувана вкладка
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const [dragging, setDragging] = useState(false);
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
        cursor: "grab",
        userSelect: "none",
        display: "flex",
        alignItems: "center",
    };

    const handleMouseDown = () => setDragging(false);
    const handleMouseMove = () => setDragging(true);

    const handleMouseUp = () => {
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
            {...attributes}
            {...listeners}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <Tab icon={icon} name={name} url={url} />
        </div>
    );
}

export default function TabsBar() {
    const [orderedTabs, setOrderedTabs] = useState(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        return saved ? JSON.parse(saved)
            : defaultTabs.map((tab, i) => ({ ...tab, id: i.toString() }));
    });

    const [tabWidths, setTabWidths] = useState({});
    const width = useWindowWidth();
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

    const handleDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;

        const oldIndex = orderedTabs.findIndex((t) => t.id === active.id);
        const newIndex = orderedTabs.findIndex((t) => t.id === over.id);
        setOrderedTabs((tabs) => arrayMove(tabs, oldIndex, newIndex));
    };

    const widthsInOrder = orderedTabs.map((tab) => tabWidths[tab.id] || 0);

    //які вкладки вміщуються у видимій частині
    function findLastIndexThatFits() {
        let sum = 0;
        for (let i = 0; i < widthsInOrder.length; i++) {
            sum += widthsInOrder[i];
            if (sum > width - 40) { //+ ширина для кнопки
                return i - 1;
            }
        }
        return widthsInOrder.length - 1;
    }

    const lastIndexThatFits = findLastIndexThatFits();
    const visibleTabs = orderedTabs.slice(0, lastIndexThatFits + 1);
    const dropdownTabs = orderedTabs.slice(lastIndexThatFits + 1);
    const showDropdownButton = dropdownTabs.length > 0;

    return (
        <>
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <SortableContext
                        items={visibleTabs.map((t) => t.id)}
                        strategy={horizontalListSortingStrategy}
                    >
                        <div style={{ display: "flex", flexWrap: "nowrap" }}>
                            {visibleTabs.map((tab) => (
                                <SortableTab
                                    key={tab.id}
                                    {...tab}
                                    onWidthMeasured={handleWidthMeasured}
                                />
                            ))}
                        </div>
                    </SortableContext>

                    {showDropdownButton && (
                        <div
                            style={{
                                width: 20,
                                height: 20,
                                marginLeft: 8,
                                cursor: "pointer",
                                userSelect: "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "1px solid #ccc",
                                borderRadius: 3,
                                transform: dropdownOpen ? "rotate(180deg)" : "none",
                                transition: "transform 0.3s ease",
                            }}
                            onClick={() => setDropdownOpen((o) => !o)}
                        >
                            <img src={dropDownBtn} />
                        </div>
                    )}
                </div>

                {dropdownOpen && dropdownTabs.length > 0 && (
                    <SortableContext
                        items={dropdownTabs.map((t) => t.id)}
                        strategy={rectSortingStrategy}
                    >
                        <div
                            style={{
                                position: "absolute",
                                marginTop: 4,
                                border: "2px solid black",
                                padding: "8px",
                                zIndex: 10,
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                            }}
                        >
                            {dropdownTabs.map((tab) => (
                                <SortableTab
                                    key={tab.id}
                                    {...tab}
                                    onWidthMeasured={() => {}}
                                    isDropdown={true}
                                />
                            ))}
                        </div>
                    </SortableContext>
                )}
            </DndContext>
        </>
    );
}
