import { Outlet } from "react-router";
import Header from "./Header";
import SideBar from "./SideBar";
import TabsBar from "../TabsBar";

import styles from './Layout.module.css';

const Layout = () => {
    return (
        <div className={styles.layoutContainer}>
            <Header />
            <SideBar />
            <div className={styles.contentArea}>
                <div className={styles.tabsContainer}>
                    <TabsBar />
                </div>
                <main className={styles.mainContent}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;