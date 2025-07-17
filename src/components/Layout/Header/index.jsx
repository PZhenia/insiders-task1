import React from "react";

export default function Header() {
    return (
        <header
            style={{
                width: "100%",
                height: "60px",
                backgroundColor: "#ffffff",
                borderBottom: "1px solid #ddd",
                display: "flex",
                alignItems: "center",
                padding: "0 20px",
                boxSizing: "border-box",
                position: "fixed",
                top: 0,
                left: 0,
                zIndex: 1000
            }}
        >
        </header>
    );
};

