import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('Burning Man Camp Dues Tracker App', () => {
  function setup() {
    // re-mount between tests for full independence
    return render(<App />);
  }

  test('renders splash screen and allows portal switching', () => {
    setup();
    expect(screen.getByText(/Burning Man Camp Dues Tracker/i)).toBeInTheDocument();
    expect(screen.getByText(/Festive, vibrant, and simple dues management/i)).toBeInTheDocument();

    // Switch to admin
    userEvent.click(screen.getByRole('button', { name: /Admin Login/i }));
    expect(screen.getByRole('heading', { name: /Admin Dashboard/i })).toBeInTheDocument();

    // Logout returns to splash
    userEvent.click(screen.getByRole('button', { name: /Logout/i }));
    expect(screen.getByText(/Burning Man Camp Dues Tracker/i)).toBeInTheDocument();

    // Switch to member portal
    userEvent.click(screen.getByRole('button', { name: /Member Portal/i }));
    expect(screen.getByRole('heading', { name: /Member Portal/i })).toBeInTheDocument();
  });

  test('admin: can add a camp member, edit, and remove them', () => {
    setup();
    userEvent.click(screen.getByRole('button', { name: /Admin Login/i }));

    // Add member flow
    userEvent.click(screen.getByRole('button', { name: /\+ Add Member/i }));
    const dialog = screen.getByRole('dialog', { hidden: true }) || screen.getByText(/Add New Member/i).closest('form');
    expect(dialog).toBeInTheDocument();

    // Fill out form and submit
    userEvent.clear(screen.getByPlaceholderText(/e.g. Luna Spark/i));
    userEvent.type(screen.getByPlaceholderText(/e.g. Luna Spark/i), 'Disco Dave');
    userEvent.clear(screen.getByLabelText(/Dues Amount/i));
    userEvent.type(screen.getByLabelText(/Dues Amount/i), '333');
    userEvent.clear(screen.getByLabelText(/Due Date/i));
    userEvent.type(screen.getByLabelText(/Due Date/i), '2024-09-12');
    userEvent.click(screen.getByRole('button', { name: /Add Member/i }));

    // The member should now be in the table
    expect(screen.getByText('Disco Dave')).toBeInTheDocument();
    expect(screen.getAllByText('$333')).toHaveLength(2); // Due and Balance

    // Edit Member: open dialog, change name, save
    const editButton = screen.getAllByRole('button', { name: /Edit/i }).find(btn =>
      within(btn.parentElement.parentElement).getByText('Disco Dave')
    );
    userEvent.click(editButton);
    userEvent.clear(screen.getByPlaceholderText(/e.g. Luna Spark/i));
    userEvent.type(screen.getByPlaceholderText(/e.g. Luna Spark/i), 'Sparkle Dave');
    userEvent.click(screen.getByRole('button', { name: /Save Changes/i }));
    expect(screen.getByText('Sparkle Dave')).toBeInTheDocument();

    // Remove: open confirm, accept
    // Simulate window.confirm always true for test
    window.confirm = jest.fn(() => true);
    const removeButton = screen.getAllByRole('button', { name: /Remove/i }).find(btn =>
      within(btn.parentElement.parentElement).getByText('Sparkle Dave')
    );
    userEvent.click(removeButton);
    expect(screen.queryByText('Sparkle Dave')).not.toBeInTheDocument();
  });

  test('admin: prevents more than 80 members', async () => {
    setup();
    userEvent.click(screen.getByRole('button', { name: /Admin Login/i }));
    // Add up to the limit
    for (let i = 0; i < 77; i++) {
      userEvent.click(screen.getByRole('button', { name: /\+ Add Member/i }));
      userEvent.clear(screen.getByPlaceholderText(/e.g. Luna Spark/i));
      userEvent.type(screen.getByPlaceholderText(/e.g. Luna Spark/i), `Camper${i}`);
      userEvent.clear(screen.getByLabelText(/Dues Amount/i));
      userEvent.type(screen.getByLabelText(/Dues Amount/i), '100');
      userEvent.clear(screen.getByLabelText(/Due Date/i));
      userEvent.type(screen.getByLabelText(/Due Date/i), '2024-09-01');
      userEvent.click(screen.getByRole('button', { name: /Add Member/i }));
    }
    expect(screen.getAllByRole('row')).toHaveLength(81); // header + 80 members
    // Try to add one more
    window.alert = jest.fn();
    userEvent.click(screen.getByRole('button', { name: /\+ Add Member/i }));
    expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/Maximum of 80 camp members reached/));
  });

  test('admin: can set dues/due date for all, and values update', () => {
    setup();
    userEvent.click(screen.getByRole('button', { name: /Admin Login/i }));
    userEvent.clear(screen.getByPlaceholderText(/Dues/));
    userEvent.type(screen.getByPlaceholderText(/Dues/), '150');
    userEvent.clear(screen.getAllByLabelText(/date/i)[0]);
    userEvent.type(screen.getAllByLabelText(/date/i)[0], '2024-09-11');
    userEvent.click(screen.getByRole('button', { name: /Set Dues for All/i }));

    // Dues + due dates for all members reflect new values
    expect(screen.getAllByText('$150').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2024-09-11').length).toBeGreaterThan(0);
  });

  test('admin: can record payments, prevent overpay, and payments update balance', () => {
    setup();
    userEvent.click(screen.getByRole('button', { name: /Admin Login/i }));

    // Find 'Bob Playa' who initially has $250 due and $250 paid
    let row = screen.getByText('Bob Playa').closest('tr');
    expect(within(row).getByText('$0')).toBeInTheDocument();

    // Find 'Carmen Dust' ($250 owed, no payment)
    row = screen.getByText('Carmen Dust').closest('tr');
    expect(within(row).getByText('$250')).toBeInTheDocument();
    // Record payment for 'Carmen Dust'
    const recordBtn = within(row).getByRole('button', { name: /Record Payment/i });
    userEvent.click(recordBtn);

    // PaymentDialog appears
    const paymentDialog = screen.getByText(/Record Payment for/i).closest('form');
    expect(paymentDialog).toBeInTheDocument();

    // Try overpayment
    window.alert = jest.fn();
    userEvent.type(screen.getByLabelText(/Amount/i), '300');
    userEvent.click(screen.getByRole('button', { name: /Record/i }));
    expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/Cannot pay more than outstanding balance/));

    // Record a valid payment
    userEvent.clear(screen.getByLabelText(/Amount/i));
    userEvent.type(screen.getByLabelText(/Amount/i), '200');
    userEvent.click(screen.getByRole('button', { name: /Record/i }));

    // Row should now show $50 balance
    row = screen.getByText('Carmen Dust').closest('tr');
    expect(within(row).getByText('$50')).toBeInTheDocument();
  });

  test('member portal: member can view their details and payment history', () => {
    setup();
    userEvent.click(screen.getByRole('button', { name: /Member Portal/i }));

    // List should show Alice Burner, Bob Playa, Carmen Dust
    expect(screen.getByText('Alice Burner')).toBeInTheDocument();

    // Find and select Bob Playa
    userEvent.click(screen.getByRole('button', { name: /Bob Playa/i }));

    // Member info view should open
    expect(screen.getByText('Bob Playa')).toBeInTheDocument();
    expect(screen.getByText('Amount Due:')).toBeInTheDocument();
    expect(screen.getByText('Outstanding Balance:')).toBeInTheDocument();
    expect(screen.getByText('$250')).toBeInTheDocument();
    expect(screen.getByText('2024-08-15')).toBeInTheDocument();
    expect(screen.getByText('Payment History:')).toBeInTheDocument();
    // Payment history entry present
    expect(screen.getByText('$250')).toBeInTheDocument();
    expect(screen.getByText('2024-05-08')).toBeInTheDocument();

    // Back button returns to selector
    userEvent.click(screen.getByRole('button', { name: /Back/i }));
    expect(screen.getByText('Choose your name:')).toBeInTheDocument();
  });

  test('all core UI dialogs and modals open and close as expected', () => {
    setup();
    userEvent.click(screen.getByRole('button', { name: /Admin Login/i }));
    // Add Member Dialog
    userEvent.click(screen.getByRole('button', { name: /\+ Add Member/i }));
    expect(screen.getByText(/Add New Member/i)).toBeInTheDocument();
    userEvent.click(screen.getByRole('button', { name: /Cancel/i })); // Close

    // Edit (use Alice Burner)
    const editBtn = screen.getAllByRole('button', { name: /Edit/i })[0];
    userEvent.click(editBtn);
    expect(screen.getByText(/Edit Member/i)).toBeInTheDocument();
    userEvent.click(screen.getByRole('button', { name: /Cancel/i }));

    // Payment dialog (Alice)
    const recordBtn = screen.getAllByRole('button', { name: /Record Payment/i })[0];
    userEvent.click(recordBtn);
    expect(screen.getByText(/Record Payment for/i)).toBeInTheDocument();
    userEvent.click(screen.getByRole('button', { name: /Cancel/i }));
  });
});
