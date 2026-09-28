import { Expense, Income, Budget, Goal, User } from '../types';

export const DEMO_USER: User = {
  id: 1,
  name: 'Aryan Sharma',
  email: 'aryan.sharma@bca.edu',
  createdAt: '2025-01-10',
};

export function generate14MonthsDemoData(userId: number = 1): {
  expenses: Expense[];
  incomes: Income[];
  budgets: Budget[];
  goals: Goal[];
} {
  const expenses: Expense[] = [];
  const incomes: Income[] = [];
  const budgets: Budget[] = [];
  let expId = 1;
  let incId = 1;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  // Generate for 14 months back up to current month
  for (let offset = 13; offset >= 0; offset--) {
    let y = currentYear;
    let m = currentMonth - offset;
    while (m <= 0) {
      m += 12;
      y -= 1;
    }
    const monthStr = `${y}-${String(m).padStart(2, '0')}`;

    // Monthly Salary
    const salary = 52000 + (offset % 2 === 0 ? 3000 : 0);
    incomes.push({
      id: incId++,
      userId,
      date: `${monthStr}-01`,
      source: 'Salary',
      amount: salary,
    });

    // Quarterly Freelance bonus
    if (offset % 3 === 0) {
      incomes.push({
        id: incId++,
        userId,
        date: `${monthStr}-15`,
        source: 'Freelance',
        amount: 12500,
      });
    }

    // Monthly fixed Rent
    expenses.push({
      id: expId++,
      userId,
      date: `${monthStr}-02`,
      category: 'Rent',
      description: 'Monthly Apartment Rent',
      amount: 12000,
    });

    // Monthly Utility Bills
    const billAmt = Math.round(2200 + Math.sin(offset) * 300);
    expenses.push({
      id: expId++,
      userId,
      date: `${monthStr}-05`,
      category: 'Bills',
      description: 'Electricity & Broadband Bill',
      amount: billAmt,
    });

    // Subscriptions
    expenses.push({
      id: expId++,
      userId,
      date: `${monthStr}-08`,
      category: 'Subscriptions',
      description: 'Streaming & Cloud Storage',
      amount: 899,
    });

    // Food & Dining (4 entries spread across month)
    const foodItems = [
      { desc: 'Weekly Supermarket Groceries', base: 2100 },
      { desc: 'Cafe & Weekend Dining Out', base: 1650 },
      { desc: 'Fresh Vegetables & Dairy', base: 1850 },
      { desc: 'Online Food Delivery & Snacks', base: 1400 },
    ];
    [4, 11, 18, 25].forEach((day, idx) => {
      const variation = Math.round((Math.cos(offset + idx) * 200));
      expenses.push({
        id: expId++,
        userId,
        date: `${monthStr}-${String(day).padStart(2, '0')}`,
        category: 'Food',
        description: foodItems[idx].desc,
        amount: foodItems[idx].base + variation,
      });
    });

    // Transport
    const transportAmt = Math.round(2600 + Math.sin(offset * 2) * 400);
    expenses.push({
      id: expId++,
      userId,
      date: `${monthStr}-14`,
      category: 'Transport',
      description: 'Metro Card Recharge & Cab Rides',
      amount: transportAmt,
    });

    // Shopping
    const shopAmt = Math.round(3200 + (offset === 1 ? 2500 : Math.cos(offset) * 800));
    expenses.push({
      id: expId++,
      userId,
      date: `${monthStr}-21`,
      category: 'Shopping',
      description: 'Apparel & Tech Accessories',
      amount: shopAmt,
    });

    // Entertainment or Education (alternating)
    if (offset % 2 === 0) {
      expenses.push({
        id: expId++,
        userId,
        date: `${monthStr}-23`,
        category: 'Entertainment',
        description: 'Movie IMAX Tickets & Arcade',
        amount: 1600,
      });
    } else {
      expenses.push({
        id: expId++,
        userId,
        date: `${monthStr}-26`,
        category: 'Education',
        description: 'Programming Certification Course',
        amount: 2499,
      });
    }

    // Add budgets for the recent 3 months
    if (offset <= 2) {
      budgets.push(
        { id: budgets.length + 1, userId, month: monthStr, category: 'Food', budgetAmount: 7500 },
        { id: budgets.length + 2, userId, month: monthStr, category: 'Rent', budgetAmount: 12000 },
        { id: budgets.length + 3, userId, month: monthStr, category: 'Transport', budgetAmount: 3200 },
        { id: budgets.length + 4, userId, month: monthStr, category: 'Shopping', budgetAmount: 4000 },
        { id: budgets.length + 5, userId, month: monthStr, category: 'Entertainment', budgetAmount: 2000 }
      );
    }
  }

  const goals: Goal[] = [
    {
      id: 1,
      userId,
      name: 'MacBook Pro M-Series',
      targetAmount: 85000,
      currentAmount: 52000,
      deadline: '2026-11-30',
    },
    {
      id: 2,
      userId,
      name: 'Emergency Reserve Fund',
      targetAmount: 150000,
      currentAmount: 98000,
      deadline: '2027-03-31',
    },
    {
      id: 3,
      userId,
      name: 'Goa & Himachal Roadtrip',
      targetAmount: 35000,
      currentAmount: 24500,
      deadline: '2026-08-15',
    },
  ];

  return { expenses, incomes, budgets, goals };
}
