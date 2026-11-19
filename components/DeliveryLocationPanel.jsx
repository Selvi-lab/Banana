"use client";

import { useState } from "react";
import { X, Search, LocateFixed, Plus, MapPin, MoreHorizontal } from "lucide-react";
import styles from "./DeliveryLocationPanel.module.css";

export default function DeliveryLocationPanel({
  open,
  onClose,
  savedAddresses = [],
  onSelectAddress,
  onPincodeSubmit,
  onUseCurrentLocation,
  onAddNew,
}) {
  const [query, setQuery] = useState("");

  if (!open) return null;

  const trimmed = query.trim();
  const isPin = /^\d{6}$/.test(trimmed);
  const showPinError = /^\d+$/.test(trimmed) && trimmed.length !== 6;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isPin) {
      onPincodeSubmit?.(trimmed);
      onClose();
    }
  };

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />

      <aside
        className={styles.panel}
        role="dialog"
        aria-label="Select delivery address"
      >
        <div className={styles.handle} />

        <div className={styles.header}>
          <strong>Select delivery address</strong>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close location panel"
          >
            <X size={20} />
          </button>
        </div>

        <form className={styles.searchBox} onSubmit={handleSubmit}>
          <Search size={16} />
          <input
            type="text"
            aria-label="Enter your 6-digit delivery PIN code"
            placeholder="Enter 6-digit delivery PIN code"
            inputMode="numeric"
            maxLength={6}
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        {showPinError && (
          <small className={styles.pinError}>
            Enter a valid 6-digit PIN code.
          </small>
        )}

        {onUseCurrentLocation && (
          <button
            type="button"
            className={styles.useLocation}
            onClick={onUseCurrentLocation}
          >
            <LocateFixed size={18} />
            Use my current location
          </button>
        )}

        <div className={styles.divider} />

        <div className={styles.savedHead}>
          <span>Saved addresses</span>
          {onAddNew && (
            <button type="button" className={styles.addNew} onClick={onAddNew}>
              <Plus size={14} /> Add New
            </button>
          )}
        </div>

        {savedAddresses.length === 0 && (
          <p className={styles.pinError}>No saved addresses yet. Enter your PIN code above to continue.</p>
        )}

        {savedAddresses.map((address) => (
          <button
            key={address.id}
            type="button"
            className={styles.savedItem}
            onClick={() => {
              onSelectAddress?.(address);
              onClose();
            }}
          >
            <MapPin size={18} className={styles.pinIcon} />
            <span className={styles.savedText}>
              <strong>{address.name}</strong>
              <small>{address.line}</small>
            </span>
            <MoreHorizontal size={18} className={styles.menuIcon} />
          </button>
        ))}
      </aside>
    </>
  );
}