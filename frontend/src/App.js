// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import WashRecipeForm from "./components/WashRecipeForm";
import WashRecipeDetails from "./pages/WashRecipeDetails";
import WashRecipeList from "./pages/WashRecipeList";
import FabricList from "./pages/FabricList";
import StyleList from "./pages/StyleList";
import FabricCompositionChart from "./components/FabricCompositionChart";
import DefectComparison from "./components/DefectComparison";

function App() {
  const {
    activeMenu,
    themeSettings,
    setThemeSettings,
    currentColor,
    currentMode,
  } = useStateContext();
  return (
    <div className={currentMode === "Dark" ? "dark" : ""}>
      <ToastContainer
        transition={Zoom}
        position="top-center"
        autoClose={3000}
        toastStyle={{ backgroundColor: currentColor }}
      />
      {/* basename="/test" */}
      <BrowserRouter>
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
                {/* Dashboard */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/reports/defects" element={<DefectReport />} />
                <Route
                  path="/fabricCompositionChart"
                  element={<FabricCompositionChart />}
                />
                <Route
                  path="/defectComparison"
                  element={<DefectComparison />}
                />
                {/* Pages */}
                <Route path="/login" element={<Login />} />
                <Route path="/defectslist" element={<DefectList />} />
                <Route path="/defects/:id" element={<DefectDetail />} />{" "}
                {/* Note the :id parameter */}
                <Route path="/orders" element={<OrderList />} />
                <Route path="/orders/:orderId" element={<OrderDetails />} />
                <Route path="/wash-recipes" element={<WashRecipeForm />} />
                <Route path="/washing" element={<WashRecipeList />} />
                <Route
                  path="/wash-recipes/:id"
                  element={<WashRecipeDetails />}
                />
                <Route path="/fabriclist" element={<FabricList />} />
                <Route path="/stylelist" element={<StyleList />} />
              </Routes>
            </div>
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
