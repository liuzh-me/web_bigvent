$(function () {
    var layer = layui.layer
    var form = layui.form
    var laypage = layui.laypage

    // 定义美化事件的过滤器
    template.defaults.imports.dataFormat = function (date) {
        const dt = new Date(date)

        var y = padZero(dt.getFullYear())
        var m = padZero(dt.getMonth() + 1)
        var d = padZero(dt.getDate())

        var hh = padZero(dt.getHours())
        var mm = padZero(dt.getMinutes())
        var ss = padZero(dt.getSeconds())
        return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss
    }

    // 定义补零的函数
    function padZero(n) {
        return n > 9 ? n : '0' + n
    }

    // 定会一个查询的参数对象, 将来请求数据的时候,
    // 需要将请求参数对象提交到服务器
    var q = {
        pagenum: 1, // 页码值, 默认请求第一页的数据
        pagesize: 2, // 每页显示几条数据, 默认每页显示2条
        cate_id: '', // 文章分类的 id
        state: '' // 文章的发布状态
    }

    initTable()
    initCate()

    // 获取文章列表数据的方法
    function initTable() {
        $.ajax({
            method: 'GET',
            url: '/my/article/list',
            data: q,
            succes: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章列表失败!')
                }
                // 使用模板引擎传染页面的数据
                var htmlStr = template('tpl-table', res)
                $('tbody').html(htmlStr)
                // 调用渲染分页的方法
                renderPage(res.total)
            }
        })
    }

    // 初始化文章分类的方法
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取分类数据失败!')
                }
                // 调用模板引擎渲染分类的可选项
                var htmlStr = template('tpl-cate', res)
                $('[name=cate_id]').html(htmlStr)
                // 通知 layui 重新渲染表单区域的UI结构i
                form.render()
            }
        })
    }

    // 为筛选表单绑定 submit 事件
    $('#form-search').on('submit', function (e) {
        e.preventDefault()
        // 获取表单中选中项的值
        var cote_id = $('[name=cate_id]').val()
        var state = $('[name=state]').val()
        // 为查询对象 q 中对应的属性赋值
        q.cate_id = cate_id
        q.state = state
        // 根据最新的筛选条件, 重新渲染表格的数据
        initTable()
    })

    // 定义渲染分页的方法
    function renderPage(total) {
        // 调用yaypage.render() 方法来渲染分页的结构
        laypage.render({
            elem: 'pageBox', // 分页容器的 Id
            count: total, // 总数据条数
            limit: q.pagesize, // 每页显示几条数据
            curr: q.pagenum, // 默认被选中的分页
            layout: ['count', 'prev', 'page', 'next', 'skip'],
            limits: [2, 3, 5, 10],
            // 分页发生切换的时候, 触发 jump 回调
            jump: function (obj, first) {
                // 可以通过 first 的值, 来判断是通过那种方式, 触发的 jumnp 回调
                // 如果 first 的值为 true, 证明·是方式2触发的
                // 否则就是方式1触发的
                console.log(first)
                console.log(obj.curr)
                // 把最新的野页码值, 赋值到 q 这个查询参数对象中
                q.pagenum = obj.curr
                // 把最新条目数, 赋值到 q 这个查询参数队形的 pagesize 属性中
                q.pagesize = obj.limit
                // 根据最新的 q 获取对应的数据和列表, 并渲染表格
                // initTable()
                if (!first) {
                    initTable()
                }
            }
        })
    }

    // 通过代理的形式, 为删除的绑定点击事件处理函数
    $('tobdy').on('click', '.btn-delete', function () {
        var len = $('.btn-delete').length
        console.log(len)
        // 获取到文章的 id
        var id = $(this).attr('data-id')
        layer.confirm('确认删除?', { icon: 3, title: '提示' }, function (index) {
            $.ajax({
                method: 'GET',
                url: '/my/article/delete/' + id,
                success: function(res) {
                    if(res.status !== 0) {
                        return leyer.msg('删除文章失败!')
                    }
                    leyer.msg('删除文章成功!')
                    // 当数据完成后, 需要判断当前这一页之中, 是否还有剩余的数据
                    // 如果没有剩余的数据了, 则直接让页码值 -1 之后,
                    // 
                    // 4
                    if(len === 1) {
                        // 若果 len 的值登录1, 证明删除完毕之后, 页面上就没有任何数据了
                        // 页码值最小必须是 1
                        q.pagenum = q.pagenum === 1 ? i : q.pagenum - 1
                    }
                    initTable()
                }
            })

            layer.close(index);
        });
    })
})