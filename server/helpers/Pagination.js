import querystring from 'querystring';

class Pagination {
  constructor(query) {
    const { page = 1, limit = 10, ...options } = query;
    this.page = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    this.limit = parseInt(limit, 10) >= 0 ? parseInt(limit, 10) : 10;
    this.skip = (page - 1) * limit;
    this.options = options;
    this.originalUrl = '';
  }

  setOriginalUrl(url) {
    this.originalUrl = url;
    return this;
  }

  setTotal(total) {
    this.total = parseInt(total, 10);
    this.lastPage = Math.ceil(this.total / this.limit) || 1;
    this.prevPage = this.page > 1 ? this.page - 1 : 0;
    this.nextPage = this.page < this.lastPage ? this.page + 1 : 0;
    this.firstPage = 1;
    return this;
  }

  parseUrl(page) {
    return page
      ? `${this.originalUrl}?${querystring.stringify({
          ...this.options,
          page: this.page,
          limit: this.limit,
        })}`
      : null;
  }

  getLinks() {
    return {
      first: this.parseUrl(this.firstPage),
      last: this.parseUrl(this.lastPage),
      prev: this.parseUrl(this.prevPage),
      next: this.parseUrl(this.nextPage),
      self: this.parseUrl(this.page),
    };
  }

  getMeta() {
    return {
      current_page: this.page,
      total_pages: this.lastPage,
      per_page: this.limit,
      total: this.total,
    };
  }
}

export default Pagination;
