import { Routes, Route, BrowserRouter } from 'react-router-dom';
import './App.css';
import MainMenuPage from './pages/MainMenuPage';
import ContestScreen from './pages/ContestScreen';
import RankingsPage from './pages/RankingsPage';
import { GameProviderWrapper } from './contexts/GameContext';

function App() {

  return (
    <BrowserRouter>
      <GameProviderWrapper>
        <Routes>
          <Route path='/' element={<MainMenuPage/>}/>
          <Route path='/contest' element={<ContestScreen/>}/>
          <Route path='/rankings' element={<RankingsPage/>}/>
          <Route path='*' element={<div>Página no encontrada</div>}/>
        </Routes>
      </GameProviderWrapper>
    </BrowserRouter>
  )
}

export default App
