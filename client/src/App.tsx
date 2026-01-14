import { AppRouter } from "./routes/AppRouter";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import "./App.css";

function App() {
  return (
    <>
      <AppRouter />
      <Toaster />
      <Sonner />
    </>
  );
}

export default App;