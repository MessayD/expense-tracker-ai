import {
  Expense,
  ExpenseCategory,
  CategoryBudget,
  BudgetSettings,
  RecurringExpense,
  SmartInsight,
  FinancialHealth,
  SavingsGoal,
} from '@/types/expense';

// ========== BUDGET MANAGEMENT ==========

export const calculateCategoryBudgets = (
  expenses: Expense[],
  budgetSettings: BudgetSettings
): CategoryBudget[] => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
  });

  const categories: ExpenseCategory[] = [
    'Food',
    'Transportation',
    'Entertainment',
    'Shopping',
    'Bills',
    'Other',
  ];

  return categories.map(category => {
    const spent = monthlyExpenses
      .filter(exp => exp.category === category)
      .reduce((sum, exp) => sum + exp.amount, 0);

    const monthlyLimit = budgetSettings.budgets[category] || 0;
    const remaining = monthlyLimit - spent;
    const percentageUsed = monthlyLimit > 0 ? (spent / monthlyLimit) * 100 : 0;

    return {
      category,
      monthlyLimit,
      spent,
      remaining,
      percentageUsed,
    };
  });
};

// ========== RECURRING EXPENSE DETECTION ==========

export const detectRecurringExpenses = (expenses: Expense[]): RecurringExpense[] => {
  const recurring: RecurringExpense[] = [];

  // Group expenses by description (normalized)
  const expenseGroups = expenses.reduce((acc, exp) => {
    const key = exp.description.toLowerCase().trim();
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(exp);
    return acc;
  }, {} as Record<string, Expense[]>);

  // Analyze each group
  Object.entries(expenseGroups).forEach(([description, exps]) => {
    if (exps.length < 2) return; // Need at least 2 occurrences

    // Sort by date
    const sorted = [...exps].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate intervals in days
    const intervals: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const diff =
        (new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime()) /
        (1000 * 60 * 60 * 24);
      intervals.push(diff);
    }

    // Calculate average interval
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    // Determine frequency
    let frequency: 'daily' | 'weekly' | 'monthly' = 'monthly';
    let confidence = 0;

    // Calculate standard deviation for confidence
    const variance =
      intervals.reduce((acc, val) => acc + Math.pow(val - avgInterval, 2), 0) /
      intervals.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = (stdDev / avgInterval) * 100;

    // Lower variation = higher confidence
    confidence = Math.max(0, Math.min(100, 100 - coefficientOfVariation));

    if (avgInterval <= 3) {
      frequency = 'daily';
    } else if (avgInterval <= 10) {
      frequency = 'weekly';
    } else {
      frequency = 'monthly';
    }

    // Only consider it recurring if we have good confidence and enough data
    if (confidence > 40 && exps.length >= 2) {
      const averageAmount =
        exps.reduce((sum, exp) => sum + exp.amount, 0) / exps.length;

      const lastExpenseDate = new Date(sorted[sorted.length - 1].date);
      const nextExpectedDate = new Date(lastExpenseDate);
      nextExpectedDate.setDate(lastExpenseDate.getDate() + Math.round(avgInterval));

      recurring.push({
        description: exps[0].description,
        category: exps[0].category,
        averageAmount,
        frequency,
        occurrences: exps.length,
        confidence: Math.round(confidence),
        lastOccurrence: sorted[sorted.length - 1].date,
        nextExpected: nextExpectedDate.toISOString().split('T')[0],
      });
    }
  });

  return recurring.sort((a, b) => b.confidence - a.confidence);
};

// ========== SMART INSIGHTS GENERATION ==========

export const generateInsights = (
  expenses: Expense[],
  budgets: CategoryBudget[],
  recurringExpenses: RecurringExpense[]
): SmartInsight[] => {
  const insights: SmartInsight[] = [];
  let insightId = 0;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
  });

  // Budget warnings
  budgets.forEach(budget => {
    if (budget.monthlyLimit > 0) {
      if (budget.percentageUsed >= 100) {
        insights.push({
          id: `insight-${insightId++}`,
          type: 'warning',
          title: `${budget.category} Budget Exceeded!`,
          message: `You've spent $${budget.spent.toFixed(2)} of your $${budget.monthlyLimit.toFixed(2)} budget (${budget.percentageUsed.toFixed(0)}%). Consider reducing expenses in this category.`,
          category: budget.category,
          date: new Date().toISOString(),
          priority: 5,
        });
      } else if (budget.percentageUsed >= 80) {
        insights.push({
          id: `insight-${insightId++}`,
          type: 'warning',
          title: `${budget.category} Budget Warning`,
          message: `You're at ${budget.percentageUsed.toFixed(0)}% of your ${budget.category} budget with $${budget.remaining.toFixed(2)} remaining this month.`,
          category: budget.category,
          date: new Date().toISOString(),
          priority: 4,
        });
      }
    }
  });

  // Spending trends
  const lastMonthExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return expDate.getMonth() === lastMonth && expDate.getFullYear() === lastMonthYear;
  });

  const thisMonthTotal = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const lastMonthTotal = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  if (lastMonthTotal > 0) {
    const change = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;

    if (change > 20) {
      insights.push({
        id: `insight-${insightId++}`,
        type: 'warning',
        title: 'Spending Increased Significantly',
        message: `Your spending is up ${change.toFixed(0)}% compared to last month ($${thisMonthTotal.toFixed(2)} vs $${lastMonthTotal.toFixed(2)}).`,
        date: new Date().toISOString(),
        priority: 4,
      });
    } else if (change < -20) {
      insights.push({
        id: `insight-${insightId++}`,
        type: 'achievement',
        title: 'Great Job Saving!',
        message: `You've reduced spending by ${Math.abs(change).toFixed(0)}% compared to last month. Keep up the good work!`,
        date: new Date().toISOString(),
        priority: 3,
      });
    }
  }

  // Recurring expense predictions
  if (recurringExpenses.length > 0) {
    const upcomingExpenses = recurringExpenses.filter(rec => {
      const nextDate = new Date(rec.nextExpected);
      const daysUntil = (nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntil >= 0 && daysUntil <= 7;
    });

    if (upcomingExpenses.length > 0) {
      const totalUpcoming = upcomingExpenses.reduce(
        (sum, exp) => sum + exp.averageAmount,
        0
      );
      insights.push({
        id: `insight-${insightId++}`,
        type: 'prediction',
        title: 'Upcoming Recurring Expenses',
        message: `${upcomingExpenses.length} recurring expense(s) expected this week (~$${totalUpcoming.toFixed(2)}). Plan ahead!`,
        date: new Date().toISOString(),
        priority: 3,
      });
    }
  }

  // Achievements
  const allBudgetsSet = budgets.every(b => b.monthlyLimit > 0);
  const allBudgetsUnderControl = budgets
    .filter(b => b.monthlyLimit > 0)
    .every(b => b.percentageUsed < 90);

  if (allBudgetsSet && allBudgetsUnderControl && monthlyExpenses.length > 5) {
    insights.push({
      id: `insight-${insightId++}`,
      type: 'achievement',
      title: 'Budget Master!',
      message: "All your category budgets are on track. You're in great control of your finances!",
      date: new Date().toISOString(),
      priority: 2,
    });
  }

  // Tips
  const topCategory = budgets
    .filter(b => b.spent > 0)
    .sort((a, b) => b.spent - a.spent)[0];

  if (topCategory && topCategory.spent > thisMonthTotal * 0.4) {
    insights.push({
      id: `insight-${insightId++}`,
      type: 'tip',
      title: `${topCategory.category} is Your Top Expense`,
      message: `${topCategory.category} accounts for ${((topCategory.spent / thisMonthTotal) * 100).toFixed(0)}% of your spending. Look for opportunities to optimize this category.`,
      category: topCategory.category,
      date: new Date().toISOString(),
      priority: 2,
    });
  }

  return insights.sort((a, b) => b.priority - a.priority);
};

// ========== FINANCIAL HEALTH SCORE ==========

export const calculateFinancialHealth = (
  expenses: Expense[],
  budgets: CategoryBudget[],
  savingsGoals: SavingsGoal[]
): FinancialHealth => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
  });

  const lastMonthExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return expDate.getMonth() === lastMonth && expDate.getFullYear() === lastMonthYear;
  });

  // Factor 1: Budget Adherence (0-100)
  const budgetsWithLimits = budgets.filter(b => b.monthlyLimit > 0);
  let budgetAdherence = 100;

  if (budgetsWithLimits.length > 0) {
    const avgUsage =
      budgetsWithLimits.reduce((sum, b) => sum + Math.min(100, b.percentageUsed), 0) /
      budgetsWithLimits.length;
    budgetAdherence = Math.max(0, 100 - (avgUsage - 70)); // Penalty starts at 70%
  }

  // Factor 2: Savings Rate (0-100)
  const totalBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalSpent = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  let savingsRate = 0;

  if (totalBudget > 0) {
    const savedAmount = totalBudget - totalSpent;
    savingsRate = Math.max(0, Math.min(100, (savedAmount / totalBudget) * 100 * 2)); // Scale to 0-100
  }

  // Factor 3: Spending Trend (0-100)
  const lastMonthTotal = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  let spendingTrend = 50; // Neutral

  if (lastMonthTotal > 0) {
    const change = ((totalSpent - lastMonthTotal) / lastMonthTotal) * 100;
    spendingTrend = Math.max(0, Math.min(100, 50 - change)); // Lower spending = higher score
  }

  // Factor 4: Category Balance (0-100)
  const categoriesWithSpending = budgets.filter(b => b.spent > 0).length;
  const categoryBalance = categoriesWithSpending > 1 ? 80 : 50; // Diverse spending is healthier

  // Calculate overall score (weighted average)
  const score = Math.round(
    budgetAdherence * 0.35 +
      savingsRate * 0.3 +
      spendingTrend * 0.2 +
      categoryBalance * 0.15
  );

  let level: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  if (score >= 80) level = 'Excellent';
  else if (score >= 60) level = 'Good';
  else if (score >= 40) level = 'Fair';
  else level = 'Poor';

  // Generate recommendations
  const recommendations: string[] = [];
  if (budgetAdherence < 70) {
    recommendations.push('Consider reviewing and adjusting your category budgets to better match your spending patterns.');
  }
  if (savingsRate < 50) {
    recommendations.push('Try to increase your savings rate by reducing discretionary spending.');
  }
  if (spendingTrend < 50) {
    recommendations.push('Your spending is trending upward. Look for areas where you can cut back.');
  }
  if (categoryBalance < 50) {
    recommendations.push('Your spending is concentrated in few categories. Diversifying can reduce risk.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Great job! Keep maintaining your excellent financial habits.');
  }

  return {
    score,
    level,
    factors: {
      budgetAdherence,
      savingsRate,
      spendingTrend,
      categoryBalance,
    },
    recommendations,
  };
};
