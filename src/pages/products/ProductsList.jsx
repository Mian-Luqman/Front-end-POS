// src/pages/products/ProductsList.jsx - Multi-Tenant Version
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useLocalStorageProducts from '../../hooks/useLocalStorageProducts';

export default function ProductsList() {
  const navigate = useNavigate();
  const { products, deleteProduct, addProduct } = useLocalStorageProducts();

  const handleEdit = (product) => {
    navigate('/products/create', { state: { product } });
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete "${name}" permanently?`)) {
      deleteProduct(id);
      toast.error("Product deleted successfully!");
    }
  };

  const handleDuplicate = (product) => {
    const { id, createdAt, storeId, ...productData } = product;
    
    const duplicatedProduct = {
      ...productData,
      name: `${product.name} (Copy)`,
      sku: `${product.sku}-COPY`,
    };

    addProduct(duplicatedProduct);
    toast.success(`"${product.name}" duplicated successfully!`);
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Products List</h2>
        <button className="btn btn-primary" onClick={() => navigate('/products/create')}>
          + Add New Product
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Created</th>
              <th>Stock</th>
              <th>Unit</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan="8" className="text-center py-5">No products yet. Create one!</td></tr>
            ) : (
              products.map(p => (
                <tr key={p.id}>
                  <td>
                    <img
                      src={p.image || 'https://via.placeholder.com/50'}
                      alt={p.name}
                      style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }}
                    />
                  </td>
                  <td><strong>{p.name}</strong></td>
                  <td>Rs.{p.price}</td>
                  <td>{new Date(p.createdAt).toLocaleDateString('en-GB')}</td>
                  <td>
                    {p.unlimited ? (
                      <span className="badge bg-info">♾️ Unlimited</span>
                    ) : p.quantity > 0 ? (
                      <span>{p.quantity}</span>
                    ) : (
                      <span className="text-danger">Out of Stock</span>
                    )}
                  </td>
                  <td>
                    <small className="text-muted">{p.unit || '-'}</small>
                  </td>
                  <td>
                    <span className={`badge ${p.isActive ? 'bg-success' : 'bg-secondary'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      <button
                        className="btn btn-sm btn-warning me-1"
                        onClick={() => handleEdit(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-info text-white me-1"
                        onClick={() => handleDuplicate(p)}
                      >
                        Duplicate
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(p.id, p.name)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}