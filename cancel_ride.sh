#!/bin/bash
# Manual ride cancellation script
# Usage: ./cancel_ride.sh <ride_id> <driver_token>

RIDE_ID="${1:-f64aa3f8-7ba1-489c-9247-5b69ebe7067d}"
DRIVER_TOKEN="$2"

if [ -z "$DRIVER_TOKEN" ]; then
    echo "❌ Error: Driver token required"
    echo ""
    echo "Usage: ./cancel_ride.sh <ride_id> <driver_token>"
    echo ""
    echo "Example:"
    echo "./cancel_ride.sh f64aa3f8-7ba1-489c-9247-5b69ebe7067d eyJhbGc..."
    exit 1
fi

echo "🚗 Cancelling ride: $RIDE_ID"
echo ""

# Cancel via API
curl -X POST "https://api.jktaxitamilnadu.com/api/v2/driver/rides/${RIDE_ID}/cancel" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${DRIVER_TOKEN}" \
  -d '{
    "reason": "manual_admin_cancel",
    "custom_reason": "Cancelled by admin via script"
  }' \
  -w "\n\nHTTP Status: %{http_code}\n"

echo ""
echo "✅ Done!"
