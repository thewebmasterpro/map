import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('should render the app header', () => {
    render(<App />);

    const header = screen.getByText('Hagen Logistics');
    expect(header).toBeInTheDocument();
  });

  it('should render mode switcher buttons', () => {
    render(<App />);

    const serviceButton = screen.getByText('Service');
    const deliveryButton = screen.getByText('Livraison');

    expect(serviceButton).toBeInTheDocument();
    expect(deliveryButton).toBeInTheDocument();
  });

  it('should have service mode selected by default', () => {
    render(<App />);

    const serviceButton = screen.getByText('Service');
    expect(serviceButton).toHaveClass('bg-white');
  });

  it('should switch to delivery mode when clicked', async () => {
    const { user } = await import('@testing-library/user-event');
    const userEvent = user.setup();

    render(<App />);

    const deliveryButton = screen.getByText('Livraison');
    await userEvent.click(deliveryButton);

    expect(deliveryButton).toHaveClass('bg-white');
  });
});
