export interface ParsedOrderDetails {
  bairro: string;
  reference: string;
  phone: string;
  name: string;
  deliveryDay: string;
  paymentMethod: string;
}

export function parseOrderDetails(neighborhoodStr: string): ParsedOrderDetails {
  if (!neighborhoodStr) {
    return {
      bairro: 'Desconhecido',
      reference: 'N/A',
      phone: 'N/A',
      name: 'Cliente',
      deliveryDay: 'Segunda-feira',
      paymentMethod: 'Pagamento no Ato de Entrega'
    };
  }

  const parts = neighborhoodStr.split('|').map(p => p.trim());
  const bairro = parts[0] || 'Desconhecido';
  let reference = 'N/A';
  let phone = 'N/A';
  let name = 'Cliente';
  let deliveryDay = 'Segunda-feira';
  let paymentMethod = 'Pagamento no Ato de Entrega';

  parts.forEach(part => {
    if (part.startsWith('Ref:')) {
      reference = part.replace('Ref:', '').trim();
    } else if (part.startsWith('Tel:')) {
      phone = part.replace('Tel:', '').trim();
    } else if (part.startsWith('Nome:')) {
      name = part.replace('Nome:', '').trim();
    } else if (part.startsWith('Dia:')) {
      deliveryDay = part.replace('Dia:', '').trim();
    } else if (part.startsWith('Payment:')) {
      paymentMethod = part.replace('Payment:', '').trim();
    }
  });

  // Normalize fallback for user-facing strings
  if (paymentMethod === 'Pagamento no Ato de Entrega' || paymentMethod === 'Pagamento no Ato (Dinheiro)') {
    paymentMethod = 'Pagamento no Ato de Entrega';
  }

  return { bairro, reference, phone, name, deliveryDay, paymentMethod };
}
