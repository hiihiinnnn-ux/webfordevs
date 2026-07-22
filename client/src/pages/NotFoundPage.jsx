import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="notfound">
      <h1>404</h1>
      <p>We couldn’t find that page.</p>
      <Link to="/" className="btn btn-primary">Back home</Link>
    </div>
  );
}
