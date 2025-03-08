/**
 * 產品圖標工具
 * 根據產品名稱提供適當的圖標
 */

/**
 * 根據產品名稱獲取圖標
 * @param productName 產品名稱
 * @returns 對應的 emoji 圖標
 */
export function getProductIcon(productName: string): string {
  if (!productName) return '🔄'; // 默認圖標

  // 將產品名稱轉換為小寫以便不區分大小寫比較
  const name = productName.toLowerCase();

  // 電子產品
  if (name.includes('personal_computer') || name.includes('pc')) return '💻';
  if (name.includes('smartphone')) return '📱';
  if (name.includes('electronic')) return '🔌';

  // 軟件和服務
  if (name.includes('software_app') || name.includes('saas_solution') || 
      name.includes('ai_service') || name.includes('cloud_service')) return '☁️';

  // 食物和農業
  if (name.includes('meal') || name.includes('food') || name.includes('dessert')) return '🍽️';
  if (name.includes('vegetables')) return '🥬';
  if (name.includes('fruits')) return '🍎';
  if (name.includes('grains')) return '🌾';

  // 物流和運輸
  if (name.includes('logistics') || name.includes('express_delivery') || 
      name.includes('warehousing')) return '🚚';

  // 家具和其他實體產品
  if (name.includes('furniture')) return '🪑';
  
  // 原材料
  if (name.includes('raw_materials')) return '📦';

  // 默認圖標
  return '🔄';
}
