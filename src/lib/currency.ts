/** Most offers are priced in shillings, so that's the fallback when a record carries no currency. */
export const DEFAULT_CURRENCY = 'KES';

export const formatCurrency = (value: number, currency: string = DEFAULT_CURRENCY) => {
	const locale = window.navigator.language || 'en-US';
	const symbol = new Intl.NumberFormat(locale, {
		style: 'currency',
		currency,
		currencyDisplay: 'symbol',
	})
		.formatToParts(1)
		.find((part) => part.type === 'currency')?.value ?? '';

	return `${symbol} ${value.toLocaleString(locale, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	})}`;
};
