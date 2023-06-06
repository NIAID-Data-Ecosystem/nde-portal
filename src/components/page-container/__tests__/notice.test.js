import { render } from '@testing-library/react';
import Notice from '../components/notice';
import userEvent from '@testing-library/user-event';

describe('Notice component', () => {
  afterEach(() => {
    // restore the spy created with spyOn
    jest.restoreAllMocks();
  });

  it('sets "warningOpen" to false in localStorage when clicked', async () => {
    const { getByText } = render(<Notice />);
    const button = getByText('Got it');
    jest.spyOn(Storage.prototype, 'setItem');
    Storage.prototype.setItem = jest.fn();

    await userEvent.click(button);

    expect(localStorage.setItem).toHaveBeenLastCalledWith(
      'warningOpen',
      JSON.stringify(false),
    );
  });

  it('displays "Read More" when "warningOpen" is false', () => {
    Storage.prototype.getItem = jest.fn(() => JSON.stringify(false));

    const { getByText } = render(<Notice />);
    expect(getByText('Read More')).toBeInTheDocument();
  });

  it('displays "Read Less" when "warningOpen" is true', () => {
    Storage.prototype.getItem = jest.fn(() => JSON.stringify(true));

    const { getByText } = render(<Notice />);
    expect(getByText('Read Less')).toBeInTheDocument();
  });
});
