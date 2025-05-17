import React from "react";
import { Routes, Route } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import DefectDetail from "./pages/DefectDetail";
import DefectList from "./pages/DefectList";
import "./App.css";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { useStateContext } from "./contexts/ContextProvider";
import { Navbar, Sidebar, Footer, ThemeSettings } from "./components";
import DefectReport from "./components/DefectReport";
import { ToastContainer, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OrderList from "./pages/OrderList";
import OrderDetails from "./components/OrderDetails";
import WashRecipeForm from "./components/washRecipes/WashRecipeForm";
import WashRecipeDetails from "./pages/WashRecipeDetails";
import WashRecipeList from "./pages/WashRecipeList";
import FabricList from "./pages/FabricList";
import StyleList from "./pages/StyleList";
import FabricCompositionChart from "./components/FabricCompositionChart";
import DefectComparison from "./components/DefectComparison";
import WashRecipeDashboard from "./pages/WashRecipeDashboard";
import WashRecipeDefectDashboard from "./pages/WashRecipeDefectDashboard";

import { useAuth } from "./contexts/AuthContext"; // ⬅️ ADD THIS
import PrivateRoute from "./components/PrivateRoute";
import Unauthorized from "./pages/Unauthorized"; // ⬅️ Add this import
import WashRecipeEdit from "./components/washRecipes/WashRecipeEdit";
import WashRecipeClone from "./components/washRecipes/WashRecipeClone";

function App() {
  const {
    activeMenu,
    themeSettings,
    setThemeSettings,
    currentColor,
    currentMode,
  } = useStateContext();

  const { isAuthenticated } = useAuth(); // ⬅️ USE auth state

  return (
    <div className={currentMode === "Dark" ? "dark" : ""}>
      <ToastContainer
        transition={Zoom}
        position="top-center"
        autoClose={3000}
        toastStyle={{ backgroundColor: currentColor }}
      />
      {/* ✅ Only show full layout if user is authenticated */}
      {isAuthenticated ? (
        <div className="flex relative dark:bg-main-dark-bg">
          <div className="fixed right-4 bottom-4" style={{ zIndex: "1000" }}>
            <TooltipComponent content="Settings" position="Top">
              <button
                type="button"
                className="text-3xl p-3 hover:drop-shadow-xl hover:bg-light-gray text-white"
                onClick={() => setThemeSettings(true)}
                style={{ background: currentColor, borderRadius: "50%" }}
              >
                <FiSettings />
              </button>
            </TooltipComponent>
          </div>
          {activeMenu ? (
            <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white">
              <Sidebar />
            </div>
          ) : (
            <div className="w-0 dark:bg-secondary-dark-bg">
              <Sidebar />
            </div>
          )}
          <div
            className={`dark:bg-main-dark-bg bg-main-bg min-h-screen w-full ${
              activeMenu ? "md:ml-72" : "flex-2"
            }`}
          >
            <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full">
              <Navbar />
            </div>

            <div>
              {themeSettings && <ThemeSettings />}
              <Routes>
                {/* Protected routes */}
                {/* Dashboard */}

                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute allowedRoles={["admin"]}>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route path="/reports/defects" element={<DefectReport />} />
                <Route
                  path="/fabricCompositionChart"
                  element={<FabricCompositionChart />}
                />
                <Route
                  path="/defectComparison"
                  element={<DefectComparison />}
                />
                <Route
                  path="/washRecipeDashboard"
                  element={<WashRecipeDashboard />}
                />
                <Route
                  path="/wRDefectDashboard"
                  element={<WashRecipeDefectDashboard />}
                />
                {/* Pages */}
                <Route
                  path="/defectslist"
                  element={
                    <PrivateRoute allowedRoles={["admin", "quality_manager"]}>
                      <DefectList />
                    </PrivateRoute>
                  }
                />
                <Route path="/defects/:id" element={<DefectDetail />} />
                <Route
                  path="/orders"
                  element={
                    <PrivateRoute allowedRoles={["admin", "quality_manager"]}>
                      <OrderList />
                    </PrivateRoute>
                  }
                />
                <Route path="/orders/:orderId" element={<OrderDetails />} />
                <Route path="/wash-recipes" element={<WashRecipeForm />} />
                <Route path="/wash-recipe-list" element={<WashRecipeList />} />
                <Route
                  path="/wash-recipes/clone/:id"
                  element={<WashRecipeClone />}
                />
                <Route
                  path="/wash-recipes/edit/:id"
                  element={<WashRecipeEdit />}
                />
                <Route
                  path="/wash-recipes/:id"
                  element={<WashRecipeDetails />}
                />
                <Route path="/fabriclist" element={<FabricList />} />
                <Route path="/stylelist" element={<StyleList />} />

                {/* Optional catch route */}
                <Route path="/unauthorized" element={<Unauthorized />} />
              </Routes>
            </div>
          </div>
        </div>
      ) : (
        // ✅ When NOT logged in → only show login
        <Routes>
          <Route path="/" element={<Login />} />
        </Routes>
      )}
    </div>
  );
}

export default App;
