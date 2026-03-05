
const COMMON_BANKS: Record<string, string> = {
    'Access Bank': '044',
    'Access Bank (Diamond)': '063',
    'First Bank of Nigeria': '011',
    'Guaranty Trust Bank': '058',
    'United Bank for Africa': '033',
    'Zenith Bank': '057',
    'Kuda Bank': '090267',
    'Opay (Digital Bank)': '999992',
    'Palmpay': '999991',
    'Moniepoint MFB': '50515',
    'Wema Bank': '035',
    'Stanbic IBTC Bank': '039',
    'Fidelity Bank': '070',
    'Sterling Bank': '050',
    'Union Bank of Nigeria': '032',
    'Unity Bank': '030',
    'First City Monument Bank': '214',
    'Polaris Bank': '076',
    'Titan Trust Bank': '102',
    'Providus Bank': '101',
    'Taj Bank': '302',
    'Jaiz Bank': '301',
    'Globus Bank': '00103',
    'Standard Chartered Bank': '068',
};

export const resolveBankCode = (bankName: string): string | null => {
    return COMMON_BANKS[bankName] || null;
};

export const paystackRequest = async (path: string, method: string = 'GET', body?: any) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new Error('PAYSTACK_SECRET_KEY is not defined');

    const response = await fetch(`https://api.paystack.co${path}`, {
        method,
        headers: {
            'Authorization': `Bearer ${secret}`,
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || `Paystack API error: ${response.status}`);
    }
    return data;
};
