const API_KEY ="14bc00233cbd571deebd0ed9";
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/`;

let expenses = [];
let expenseChart = null; 

async function convertCurrency(amount, from, to = "INR") {
    if (from === to) return amount; 

    try {
        const response = await fetch(`${API_URL}${from}`); 
        const data = await response.json();

        console.log(`Exchange rates for ${from}:`, data.conversion_rates); 

        if (data.conversion_rates && data.conversion_rates[to]) {
            let convertedAmount = amount * data.conversion_rates[to]; 
            console.log(`${amount} ${from} → ${convertedAmount.toFixed(2)} ${to}`);
            return convertedAmount;
        } else {
            console.error("Error fetching conversion rates:", data);
            return amount; 
        }
    } catch (error) {
        console.error("Currency API fetch error:", error);
        return amount;
    }
}
async function addExpense() {
    let name = document.getElementById("expenseName").value.trim();
    let amount = parseFloat(document.getElementById("expenseAmount").value);
    let category = document.getElementById("expenseCategory").value;
    let currency = document.getElementById("expenseCurrency").value;
    if (!name || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid expense name and amount.");
        return;
    }
    let convertedAmount = await convertCurrency(amount, currency, "INR"); 
    expenses.push({ 
        name, 
        amount: convertedAmount.toFixed(2), 
        originalAmount: amount,  
        originalCurrency: currency, 
        category 
    });

    document.getElementById("expenseName").value = "";
    document.getElementById("expenseAmount").value = "";

    updateExpenseList();
    updateChart();
}

function updateExpenseList() {
    let total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    document.getElementById("totalSpent").innerText = `₹${total.toFixed(2)}`; 

    let expenseList = document.getElementById("expenseList");
    expenseList.innerHTML = expenses.map(exp => 
        `<li>${exp.name} - ₹${exp.amount} (${exp.category}) 
        <br><small>(${exp.originalAmount} ${exp.originalCurrency} → ₹${exp.amount})</small></li>`
    ).join("");
}

function updateChart() {
    let categoryData = {};
    expenses.forEach(exp => {
        categoryData[exp.category] = (categoryData[exp.category] || 0) + parseFloat(exp.amount);
    });

    let ctx = document.getElementById("expenseChart").getContext("2d");

    // Destroy previous chart before creating a new one
    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: Object.keys(categoryData),
            datasets: [{
                data: Object.values(categoryData),
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50"]
            }]
        }
    });
}

