import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ConfigProvider } from './context/ConfigContext';

function App() {
  return (
    <ConfigProvider>
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}

export default App;
