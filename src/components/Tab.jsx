export default function Tab({ icon, name }) {

    return (
        <div
            style={{
                border: "2px solid black",
                padding: "8px",
                margin: "2px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                userSelect: "none",
            }}
        >
            <img src={icon} alt={name} style={{ width: "20px", height: "20px" }} />
            <span>{name}</span>
        </div>
    );
}
