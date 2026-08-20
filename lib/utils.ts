export const formatCurrency = (
    value: number | string,
    currency: string = "USD"
): string => {
    try {
        const num = typeof value === "string" ? parseFloat(value) : value;

        if (isNaN(num)) {
            return `$0.00`;
        }

        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    } catch (error) {
        const num = Number(value) || 0;
        return `$${num.toFixed(2)}`;
    }
};
