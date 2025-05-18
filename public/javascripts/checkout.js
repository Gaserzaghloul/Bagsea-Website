// Handle shipping method selection
const shippingMethods = document.querySelectorAll('.shipping-method');
const shippingCostElement = document.getElementById('shipping-cost');
const taxAmountElement = document.getElementById('tax-amount');
const totalAmountElement = document.getElementById('total-amount');
const orderItems = document.querySelector('.order-items');

function updateOrderSummary() {
  const selectedShipping = document.querySelector('input[name="shippingMethod"]:checked');
  if (selectedShipping) {
    const shippingCost = parseFloat(selectedShipping.dataset.price);
    const subtotal = parseFloat(orderItems.dataset.subtotal);
    const taxRate = 0.08; // 8% tax rate
    const taxAmount = subtotal * taxRate;
    const total = subtotal + shippingCost + taxAmount;

    shippingCostElement.textContent = `$${shippingCost.toFixed(2)}`;
    taxAmountElement.textContent = `$${taxAmount.toFixed(2)}`;
    totalAmountElement.textContent = `$${total.toFixed(2)}`;
  }
}

shippingMethods.forEach(method => {
  method.addEventListener('change', updateOrderSummary);
});

// Handle form submission
const form = document.getElementById('checkout-form');
form.addEventListener('submit', async function(event) {
  event.preventDefault();

  const submitButton = document.getElementById('submit-btn');
  submitButton.disabled = true;
  submitButton.textContent = 'Processing...';

  // Simulate payment processing
  setTimeout(() => {
    // Add a fake payment token
    const hiddenInput = document.createElement('input');
    hiddenInput.setAttribute('type', 'hidden');
    hiddenInput.setAttribute('name', 'stripeToken');
    hiddenInput.setAttribute('value', 'tok_test_success');
    form.appendChild(hiddenInput);

    // Submit the form
    form.submit();
  }, 1500); // Simulate 1.5 second processing time
});
