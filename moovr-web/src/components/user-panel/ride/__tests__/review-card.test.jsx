import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewCard from '../review-card';
import axios from 'axios';

jest.mock('axios');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('ReviewCard', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    jest.clearAllMocks();
  });

  it('submits rating to ride-specific endpoint when rideId provided', async () => {
    axios.post.mockResolvedValue({ data: { message: 'ok' } });
    render(
      <ReviewCard driverId={'driver1'} driverName={'Driver One'} rideId={'ride123'} path={'/ride/thank-you'} />
    );

    // Click 5th star
    const stars = await screen.findAllByRole('button', { hidden: true });
    // the last star should be index 4
    await userEvent.click(stars[4]);

    const textarea = screen.getByPlaceholderText('Write your feedback here....');
    await userEvent.type(textarea, 'Great ride!');

    const submit = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submit);

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/rides/rate/ride123'),
      { rating: 5, comment: 'Great ride!' },
      { headers: { Authorization: 'Bearer test-token' } }
    );

    expect(mockNavigate).toHaveBeenCalledWith('/ride/thank-you');
  });
});
