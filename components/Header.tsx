export default function Header() {
  return (
    <header class="header-root">
      <a href="/" class="logo">VanillaMaster</a>
      <product-search>
        <input class="search" placeholder="Search..." />
      </product-search>
      <div class="menu-wrapper">
        <a class="order-link">Order</a>
        <a class="order-history-link">Order History</a>
      </div>
    </header>
  );
}
