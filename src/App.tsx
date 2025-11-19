import { Hero, Main, Footer } from "./components/Me.tsx";

function App() {
  return (
    <div className="font-sans text-gray-900">
      <header>
        <Hero />
      </header>
      <Main />
      <Footer />
    </div>
  );
}

export default App;
