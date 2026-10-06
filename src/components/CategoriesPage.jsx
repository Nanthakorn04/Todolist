function CategoriesPage({ categories, todos, onSelect }) {
  return (
    <section className="categories-page">
      <h2 className="section-title">หมวดหมู่งาน</h2>
      <p className="section-description">เลือกหมวดหมู่เพื่อดูงานในหมวดนั้น</p>

      <div className="category-grid">
        {categories.map((category) => {
          const count = todos.filter((todo) => todo.category === category).length;
          return (
            <button
              className="category-card"
              type="button"
              key={category}
              onClick={() => onSelect(category)}
            >
              <strong>{category}</strong>
              <span className="category-count">{count} งาน</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default CategoriesPage;
