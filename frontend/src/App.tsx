import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ContextProvider } from "./context";
import { Home } from "./pages/home";
import { LoginPage } from "./pages/loginPage/LoginPage";
import { PaymentSuccessPage } from "./pages/paymentSuccessPage/PaymentSuccessPage";
import { SignupPage } from "./pages/signupPage/SignupPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <ContextProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </ContextProvider>
    </BrowserRouter>
  );
}

export default App;
