var subwaystationLoad = false;

function rotateCircle210() {
  var circle = document.querySelector('.circle');
  var text_div01 = document.querySelector('.half01-text');
  var text_div02 = document.querySelector('.half02-text');
  circle.classList.remove('rotate-390');
  text_div01.classList.toggle('div-rotate-150')
  text_div02.classList.toggle('div-rotate-150')
  text_div02.classList.remove('text-selected')
  text_div01.classList.toggle('text-selected')
  circle.classList.toggle('rotate-210');
  if (!subwaystationLoad) {
    renderWholeSubway();
    subwaystationLoad = true;
  }
}

function rotateCircle330() {
  var circle = document.querySelector('.circle');
  var text_div01 = document.querySelector('.half01-text');
  var text_div02 = document.querySelector('.half02-text');
  circle.classList.remove('rotate-210');
  text_div01.classList.remove('div-rotate-150')
  text_div02.classList.remove('div-rotate-150')
  text_div01.classList.remove('text-selected')
  text_div02.classList.toggle('text-selected')
  circle.classList.toggle('rotate-390');

  if (!subwaystationLoad) {
    renderWholeSubway();
    subwaystationLoad = true;
  }
}

document.addEventListener('DOMContentLoaded', function () {
  var circle = document.querySelector('.circle');
  var searchContainer = document.querySelector('.searchContainer');
  var filterContainer = document.querySelector('.filterContainer');
  var search_results_container = document.querySelector('.search_results_container');
  var search_btn = document.querySelector('.search_btn')
  // 监听当前点击状态
  circle.addEventListener('click', function (event) {
    var isSearch = circle.classList.contains('rotate-210');
    var isFilter = circle.classList.contains('rotate-390');
    // 当前为搜索状态
    if (isSearch) {
      // 取消筛选组件
      filterContainer.style.animation = 'slideOut 0.5s ease';
      setTimeout(function () {
        filterContainer.style.display = 'none';
      }, 500);
      // 展开搜索栏
      searchContainer.style.display = 'block';
      searchContainer.style.animation = 'slideIn 0.5s ease';
      // 点击按钮出现搜索弹窗
      search_btn.addEventListener('click', function (event) {
        search_results_container.style.display = 'block';
        search_results_container.style.animation = 'resultsIn 0.5s ease';
      })
    }
    else if (isFilter) {
      searchContainer.style.animation = 'slideOut 0.5s ease';
      setTimeout(function () {
        searchContainer.style.display = 'none';
      }, 500);
      filterContainer.style.display = 'block';
      filterContainer.style.animation = 'slideIn 0.5s ease';
    }
    else {
      searchContainer.style.animation = 'slideOut 0.5s ease';
      filterContainer.style.animation = 'slideOut 0.5s ease';
      setTimeout(function () {
        searchContainer.style.display = 'none';
        filterContainer.style.display = 'none';
      }, 500);

      density_button.classList.remove('button_clicked')
      buffer_button.classList.remove('button_clicked')

      // 搜索弹窗消失
      search_results_container.style.animation = 'resultsOut 0.5s ease';
      search_results_container.style.display = 'none';

      density_results_container.style.animation = 'resultsOut 0.5s ease';
      density_results_container.style.display = 'none';

      buffer_results_container.style.animation = 'resultsOut 0.5s ease';
      buffer_results_container.style.display = 'none';

      clearcircleList()
      loca.clear()
    }
  });
});

