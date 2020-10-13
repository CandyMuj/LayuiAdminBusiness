layui.define(['table', 'form', 'layer', 'jquery', 'element'], function (exports) {
    var $ = layui.$;
    var form = layui.form;

    var pca = {};
    pca.keys = {};
    pca.ckeys = {};

    pca.init = function (province, city, area, data, initprovince, initcity, initarea, form) {//jQuery选择器, 省-市-区

        citys = data;
        var form = layui.form;
        if (!province || !$(province).length) return;
        $(province).html('');
        $(province).append('<option selected value="">全部</option>');
        for (var i in citys) {
            $(province).append('<option value="' + citys[i].i + '">' + citys[i].s + '</option>');
            pca.keys[citys[i].i] = citys[i];
        }
        form.render('select');
        if (initprovince) $(province).next().find('[lay-value="' + initprovince + '"]').click();
        if (!city || !$(city).length) return;
        pca.formRender(city);
        form.on('select(' + $(province).attr('lay-filter') + ')', function (data) {
            var cs = pca.keys[data.value];
            $(city).html('');
            $(city).append('<option value="">全部</option>');
            
            if (cs) {
                cs = cs.c;
                for (var i in cs) {
                    $(city).append('<option value="' + cs[i].i + '">' + cs[i].s + '</option>');
                    pca.ckeys[cs[i].i] = cs[i];
                }
                $(city).find('option:eq(1)').attr('selected', true);
            }
            form.render('select');
            $(city).next().find('.layui-this').removeClass('layui-this').click();

            if (data.value == "") {
                $(city).next().find('[lay-value=""]').click()
            }
            pca.formHidden($(province).attr('lay-filter'), data.value);
            //$('.pca-label-province').html(data.value);//此处可以自己修改 显示的位置, 不想显示可以直接去掉
        });
        if (initprovince) $(province).next().find('[lay-value="' + initprovince + '"]').click();
        if (initcity) $(city).next().find('[lay-value="' + initcity + '"]').click();
        if (!area || !$(area).length) return;
        pca.formRender(area);
        form.on('select(' + $(city).attr('lay-filter') + ')', function (data) {
            var cs = pca.ckeys[data.value];
            $(area).html('');
            $(area).append('<option value="">全部</option>');
            if (cs) {
                cs = cs.c;
                for (var i in cs) {
                    $(area).append('<option value="' + cs[i].i + '">' + cs[i].s + '</option>');
                }
                $(area).find('option:eq(1)').attr('selected', true);
            }
            form.render('select');
            $(area).next().find('.layui-this').removeClass('layui-this').click();
            pca.formHidden($(city).attr('lay-filter'), data.value);
            //$('.pca-label-city').html(data.value);	//此处可以自己修改 显示的位置, 不想显示可以直接去掉
        });
        form.on('select(' + $(area).attr('lay-filter') + ')', function (data) {
            pca.formHidden($(area).attr('lay-filter'), data.value);
            //$('.pca-label-area').html(data.value);	//此处可以自己修改 显示的位置, 不想显示可以直接去掉
        });
        if (initprovince) $(province).next().find('[lay-value="' + initprovince + '"]').click();
        if (initcity) $(city).next().find('[lay-value="' + initcity + '"]').click();
        if (initarea) $(area).next().find('[lay-value="' + initarea + '"]').click();
    }

    pca.formRender = function (obj) {
        $(obj).html('');
        $(obj).append('<option>全部</option>');
        form.render('select');
    }

    pca.formHidden = function (obj, val) {
        if (!$('#pca-hide-' + obj).length)
            $('body').append('<input id="pca-hide-' + obj + '" type="hidden" value="' + val + '" />');
        else
            $('#pca-hide-' + obj).val(val);
    }

    var citys = _area;

    exports('pca', pca);
});