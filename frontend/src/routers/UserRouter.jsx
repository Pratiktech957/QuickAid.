import { Routes, Route } from "react-router-dom";

import Home from "../pages/user/Home";
import InstantHelp from "../pages/user/InstantHelp";

function UserRouter() {
    return (
        <Routes>
            <Route
                path="/"
                element={<Home />}
            />

            <Route
                path="/help"
                element={<InstantHelp />}
            />
        </Routes>
    );
}

export default UserRouter;