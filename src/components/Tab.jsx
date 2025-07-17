import { NavLink } from "react-router";

export default function Tab({ id, icon, name, url }) {
    return (
        <NavLink
            key={id}
            to={url}
            style={{
                border: "2px solid black",
                padding: "8px",
                margin: "2px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
            }}
        >
            <img src={icon} alt={name} style={{ width: "20px", height: "20px" }} />
            <span>{name}</span>
        </NavLink>
    );
}
