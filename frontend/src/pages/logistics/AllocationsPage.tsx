import { PackageCheck } from 'lucide-react';

export function AllocationsPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Train Allocations</h1>
        <p className="page-subtitle">Allocate order items to train trips</p>
      </div>
      <div className="card">
        <div className="empty-state">
          <PackageCheck className="empty-state-icon" />
          <p className="empty-state-title">No allocations yet</p>
          <p>Order item allocations to train trips will appear once the assign_order_to_train procedure and SQL queries are implemented</p>
        </div>
      </div>
    </div>
  );
}
