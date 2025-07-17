import { tabs } from "../helpers/tabsInfo.js";

import Tab from "./Tab.jsx";

export default function TabsBar() {
    return (
        <div style={{ display: "flex", flexDirection: "row" }}>
            {tabs.map((tab, index) => (
                <Tab
                    key={index}
                    icon={tab.icon}
                    name={tab.name}
                    url={tab.url}
                />
            ))}
        </div>
    );
}