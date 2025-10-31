import { formatAddress } from '../utils/format';

interface WalletStatusProps {
  userAddress: string | null;
  onConnect: () => void;
}

export function WalletStatus({ userAddress, onConnect }: WalletStatusProps) {
  if (!userAddress) {
    return (
      <button
        onClick={onConnect}
        className="btn btn-primary"
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="badge badge-success">
      Connected: {formatAddress(userAddress)}
    </div>
  );
}
