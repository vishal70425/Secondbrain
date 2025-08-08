"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_router_dom_1 = require("react-router-dom");
const LoginPage_1 = require("./components/LoginPage");
const Dashboard_1 = require("./components/Dashboard");
const SharedBrain_1 = require("./components/SharedBrain");
const AuthContext_1 = require("./context/AuthContext");
function AppContent() {
    const { token, loading } = (0, AuthContext_1.useAuth)();
    if (loading) {
        return (<div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>);
    }
    return (<react_router_dom_1.BrowserRouter>
      <react_router_dom_1.Routes>
        <react_router_dom_1.Route path="/login" element={token ? <react_router_dom_1.Navigate to="/dashboard"/> : <LoginPage_1.LoginPage />}/>
        <react_router_dom_1.Route path="/dashboard" element={token ? <Dashboard_1.Dashboard /> : <react_router_dom_1.Navigate to="/login"/>}/>
        <react_router_dom_1.Route path="/brain/:sharelink" element={<SharedBrain_1.SharedBrain />}/>
        <react_router_dom_1.Route path="/" element={<react_router_dom_1.Navigate to={token ? "/dashboard" : "/login"}/>}/>
      </react_router_dom_1.Routes>
    </react_router_dom_1.BrowserRouter>);
}
function App() {
    return (<AuthContext_1.AuthProvider>
      <AppContent />
    </AuthContext_1.AuthProvider>);
}
exports.default = App;
