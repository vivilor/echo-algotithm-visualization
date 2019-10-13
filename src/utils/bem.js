export const bem = (block, element = '', modifier = '') => element
  ? modifier
    ? `${block}__${element}--${modifier}`
    : `${block}__${element}`
  : block
