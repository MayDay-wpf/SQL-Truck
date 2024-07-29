var myTextarea;
var codeeditor;
var selectedDatabases = [];
var loadingOverlay = {
    overlay: $('<div class="loading-overlay"></div>'),
    spinner: $('<div class="loading-spinner"><div class="spinner-border text-primary" role="status"><span class="sr-only"></span></div></div>'),
    show: function () {
        $('body').append(this.overlay).append(this.spinner);
        this.overlay.fadeIn();
        this.spinner.fadeIn();
    },
    hide: function () {
        this.overlay.fadeOut();
        this.spinner.fadeOut(() => {
            this.overlay.remove();
            this.spinner.remove();
        });
    }
};
var CHECK_DATABASES_INFO = "";
var CHECK_EDITOR_INFO = "";
var RESPONSE_MSG = "";
var COPY_SUCCESS = "";
function initCodeEditor(code) {
    if (!myTextarea) {
        myTextarea = document.getElementById("myTextarea");
        codeeditor = CodeMirror.fromTextArea(myTextarea, {
            lineNumbers: true,
            mode: "sql",
            theme: "3024-night"
        });
        codeEditorSetOption(codeeditor, code);
    }
}
function codeEditorSetOption(codeEditor, code) {
    codeEditor.setOption("mode", "sql");
    codeEditor.setOption("theme", "3024-night");
    codeEditor.setValue(code);
    codeEditor.setSize('auto', '300px');
    codeEditor.on("inputRead", function (cm, event) {
        if (!cm.state.completionActive && event.origin !== 'setValue') {
            cm.showHint({
                completeSingle: false
            });
        }
    });
}
function switchLanguage() {
    var currentLang = localStorage.getItem('lang') || 'zh-CN';
    if (currentLang === 'en-US') {
        localStorage.setItem('lang', 'zh-CN');
        setLanguage('zh-CN');
    } else {
        localStorage.setItem('lang', 'en-US');
        setLanguage('en-US');
    }
}

function setLanguage(lang) {
    if (lang === 'en-US') {
        $('#langSwitchText').text('中文');
        $('#mainTitle').text('SQL-Truck enables the effortless conversion of SQL statements');
        $('#inputLabel').text('Enter SQL Statement:');
        $('#resultTitle').text('Results:');
        //codeEditorSetOption(codeeditor, 'Please enter SQL statement...')
        $('#switchBtn').html('<i data-feather="refresh-cw"></i> Convert');
        $('#setTest').html('<i data-feather="activity"></i> Load Test Case');
        $('#github').html('<i data-feather="github"></i> Visit our GitHub');
        $('#selectTitle').text('Select conversion target (multiple optional)');
        $('#convertInfo').text('*The conversion process typically requires approximately 25 to 30 seconds to complete');
        CHECK_DATABASES_INFO = "Please select at least one type of database";
        CHECK_EDITOR_INFO = "Please enter the SQL script you wish to convert";
        RESPONSE_ERRORMSG = "The conversion was unsuccessful. Please try again";
        COPY_SUCCESS = "The copy was executed successfully";
    } else {
        $('#langSwitchText').text('English');
        $('#mainTitle').text('SQL-Truck 帮助您自由转换SQL语句');
        $('#inputLabel').text('输入SQL语句:');
        $('#resultTitle').text('转换结果:');
        //codeEditorSetOption(codeeditor, '请输入SQL语句...')
        $('#switchBtn').html('<i data-feather="refresh-cw"></i> 转换');
        $('#setTest').html('<i data-feather="activity"></i> 测试用例');
        $('#github').html('<i data-feather="github"></i> 前往GitHub中查看');
        $('#selectTitle').text('选择转换目标（可多选）');
        $('#convertInfo').text('*完成转换大约需要25~30秒');
        CHECK_DATABASES_INFO = "请至少选择一种数据库";
        CHECK_EDITOR_INFO = "请输入需要转换的SQL脚本";
        RESPONSE_ERRORMSG = "转换失败,请重试";
        COPY_SUCCESS = "复制成功";
    }
    feather.replace();
}
function addLanguageLabels() {
    var selector = $("pre code");
    selector.each(function () {
        // 仅对尚未添加过语言标签的 code 元素进行处理
        if ($(this).parent().find('.code-lang-label-container').length === 0) {
            var lang = $(this).attr('class').match(/language-(\w+)/);
            if (lang) {
                // 创建语言标签容器
                var langLabelContainer = $('<div class="code-lang-label-container" style="background-color: rgb(80, 80, 90);"></div>');
                // 创建语言标签
                var langLabel = $('<span class="code-lang-label" style="color: white;">' + lang[1] + '</span>');
                // 将语言标签添加到容器中
                langLabelContainer.append(langLabel);
                // 将语言标签容器插入到代码块的顶部
                $(this).before(langLabelContainer);
            }
        }
    });
}
function addCopyBtn() {
    var codebox;
    codebox = $('pre code.hljs, pre code[class^="language-"]');
    codebox.each(function () {
        var codeBlock = $(this);

        var copyContainer = $('<div>').addClass('copy-container').css({
            'text-align': 'right',
            'background-color': 'rgb(40,44,52)',
            'padding': '4px',
            'display': 'block',
            'color': 'rgb(135,136,154)',
            'cursor': 'pointer'
        });

        var copyBtn = $('<span>').addClass('copy-btn').attr('title', 'Copy to clipboard');
        copyBtn.html(feather.icons.clipboard.toSvg());

        if ($(this).parent().find('.copy-btn').length === 0) {
            copyContainer.append(copyBtn);
            codeBlock.parent().append(copyContainer);
        }

        copyBtn.click(function () {
            var codeToCopy = codeBlock.text();
            var tempTextArea = $('<textarea>').appendTo('body').val(codeToCopy).select();
            document.execCommand('copy');
            tempTextArea.remove();
            balert(COPY_SUCCESS, "success", false, 2000, "center");
        });
    });
}
function setTest() {
    var sql = `SELECT 
      p.product_name,
      od.quantity,
      od.price,
      o.order_date,
      c.customer_name,
      c.address
  FROM 
      orders o
  INNER JOIN 
      order_details od ON o.order_id = od.order_id
  INNER JOIN 
      products p ON od.product_id = p.product_id
  INNER JOIN 
      customers c ON o.customer_id = c.customer_id
  WHERE 
      c.customer_name = 'John Doe'
  AND 
      o.order_date BETWEEN '2022-01-01' AND '2022-12-31'
  ORDER BY 
      o.order_date DESC;`;
    codeEditorSetOption(codeeditor, sql);
}

var md = window.markdownit();
function translateSQL() {
    var editorContent = codeeditor.getValue().trim();
    if (selectedDatabases.length === 0) {
        balert(CHECK_DATABASES_INFO, "warning", false, 2000, "center");
        return;
    }

    if (!editorContent) {
        balert(CHECK_EDITOR_INFO, "warning", false, 2000, "center");
        return;
    }
    loadingOverlay.show();
    $.ajax({
        url: '/Home/GetSQLConvert',  // 替换成你的后端API URL
        type: 'POST',
        dataType: 'json',
        data: {
            databasesName: selectedDatabases,
            codeEditorValue: editorContent
        },
        success: function (response) {
            loadingOverlay.hide();
            if (response.success) {
                try {
                    let resultsHtml = "";
                    response.data.aiResultDto.forEach(function (item) {
                        resultsHtml += `<li>
                                      <p class="databaseName">${item.databaseName}</p>
                                      <div>${md.render(item.sql)}</div>
                                      <hr />
                                    </li>`;
                    });
                    $('#resultList').html(resultsHtml);
                    document.querySelectorAll('pre code').forEach((block) => {
                        hljs.highlightBlock(block);
                    });
                    addLanguageLabels();
                    addCopyBtn();
                    $('html, body').animate({
                        scrollTop: $(document).height() - $(window).height()
                    }, 600);
                } catch (error) {
                    balert(RESPONSE_ERRORMSG, "danger", false, 2000, "center");
                }
            } else {
                balert(RESPONSE_ERRORMSG, "danger", false, 2000, "center");
            }
        },
        error: function (xhr, status, error) {
            loadingOverlay.hide();
            balert(RESPONSE_ERRORMSG, "danger", false, 2000, "center");
        }
    });
}

