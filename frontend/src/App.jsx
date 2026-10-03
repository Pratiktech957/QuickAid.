import { BrowserRouter, Routes, Route } from "react-router-dom";

import UserRouter from "./routers/UserRouter";
import AdminRouter from "./routers/AdminRouter";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* User routes */}
        <Route
          path="/*"
          element={<UserRouter />}
        />

        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={<AdminRouter />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;