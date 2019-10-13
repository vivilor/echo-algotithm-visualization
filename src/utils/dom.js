export const getBlockDims = el => (({ width, height }) => ({ w: width, h: height }))(el.getBoundingClientRect())

export const getDatasetNumberValue = el => key => Number(el.dataset[key] === undefined ? -1 : el.dataset[key])
