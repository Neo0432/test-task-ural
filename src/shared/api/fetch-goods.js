const parseJson = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export const fetchGoods = async (params, signal) => {
  const url = new URL('/api/', window.location.origin);
  url.search = new URLSearchParams(params).toString();

  let response;
  let text;
  try {
    response = await fetch(url, { signal });
    text = await response.text();
  } catch {
    throw new Error('Network error');
  }

  const data = parseJson(text);
  if (data?.error) {
    throw new Error(String(data.error));
  }
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  if (!Array.isArray(data?.goods)) {
    throw new Error('Unexpected API response');
  }
  return data.goods.filter((item) => item.brand);
};
