import pinBtn from "../../assets/fi-rs-thumbtack.svg"
import styles from './Tab.module.css';

export default function Tab({
                                icon, name, isActive = false,
                                isDragging = false, pinned = false
}) {
    return (
        <div className={`${styles.tab} ${isActive ? styles.active : ''} ${isDragging ? styles.dragging : ''}`}>
            <img src={icon} alt={name} className={styles.tabIcon} />
            <span>{name}</span>
            {pinned && (
                <span className={styles.pinIndicator}>
                    <img src={pinBtn} alt="Pinned" />
                </span>
            )}
        </div>
    );
}