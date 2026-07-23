interface OrderableDelegate {
  count: (args: { where: Record<string, any> }) => Promise<number>;
  updateMany: (args: {
    where: Record<string, any>;
    data: { order: { increment?: number; decrement?: number } };
  }) => Promise<any>;
  update: (args: { where: { id: string }; data: { order: number } }) => Promise<any>;
  findUnique: (args: { where: { id: string } }) => Promise<any>;
}

interface ReorderParams {
  delegate: any;
  id: string;
  currentOrder: number;
  scopeWhere: Record<string, any>; 
  requestedOrder: number;
}


export const reorderWithinScope = async ({
  delegate,
  id,
  currentOrder,
  scopeWhere,
  requestedOrder,
}: ReorderParams): Promise<number> => {
  const totalCount = await delegate.count({ where: scopeWhere });
  const maxIndex = totalCount - 1;
  const targetOrder = Math.max(0, Math.min(requestedOrder, maxIndex));

  if (targetOrder === currentOrder) {
    return targetOrder; 
  }

  if (targetOrder > currentOrder) {
    await delegate.updateMany({
      where: { ...scopeWhere, order: { gt: currentOrder, lte: targetOrder } },
      data: { order: { decrement: 1 } },
    });
  } else {
    await delegate.updateMany({
      where: { ...scopeWhere, order: { gte: targetOrder, lt: currentOrder } },
      data: { order: { increment: 1 } },
    });
  }

  await delegate.update({ where: { id }, data: { order: targetOrder } });

  return targetOrder;
};