import { GameLayout } from './components/layout/GameLayout'
import { I18nProvider } from './i18n/I18nProvider'

function App() {
  return (
    <I18nProvider>
      <GameLayout />
    </I18nProvider>
  )
}

export default App
