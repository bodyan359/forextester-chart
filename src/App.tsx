import Chart from "./components/Chart/Chart";

const SYMBOL = "EURUSD";
function App() {
  return (
    <div className="App">
      <h1> {SYMBOL} </h1>
      <Chart symbol={SYMBOL} />
    </div>
  );
}

export default App;
