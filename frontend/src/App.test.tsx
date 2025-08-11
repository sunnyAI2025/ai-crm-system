import { render, screen } from './test/test-utils';
import App from './App';

describe('App Component', () => {
  test('renders AI CRM system title', () => {
    render(<App />);
    const titleElement = screen.getByText('AI CRM系统');
    expect(titleElement).toBeInTheDocument();
  });

  test('renders frontend architecture text', () => {
    render(<App />);
    const archText = screen.getByText('前端项目架构搭建完成');
    expect(archText).toBeInTheDocument();
  });

  test('renders technology stack text', () => {
    render(<App />);
    const techText = screen.getByText('使用 React + TypeScript + Ant Design + Vite');
    expect(techText).toBeInTheDocument();
  });
});
