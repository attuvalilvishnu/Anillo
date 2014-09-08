'use strict';

/* Directives */


angular.module('myApp.directives', ['ngDialog'])
        .directive('appVersion', ['version', function(version) {
                return function(scope, elm, attrs) {
                    elm.text(version);
                };
            }])

        .directive('datatable', function($http, ngDialog) {
            return {
                restrict: 'A',
                link: function($scope, $elem, attrs) {
                    var $table = $('<table/>'), options = {}, primaryKeyColumnObject;
                    $table.addClass('grid');
                    $elem.find('.dataTables_wrapper').find('dataTables_filter').addClass('left');


                    $.extend($.fn.dataTableExt.oStdClasses, {
                        "sFilterInput": "txt",
                        "sLengthSelect": "select"
                    });


                    $table.appendTo($elem);
                    //  $elem.find('.dataTables_wrapper').find('dataTables_filter').addClass('txt');
                    options = {};
                    if (typeof $scope.dtOptions !== 'undefined') {
                        angular.extend(options, $scope.dtOptions);
                    }
                    if (typeof attrs.sajaxsource === 'undefined') {
                        throw "Ajax Source not defined! Use sajaxsource='/api/v1/blabla'";
                    }


                    //initial dt_loading
                    $http.get(GLOBAL.BASE_URL + attrs.sajaxsource).then(function(resp) {
                        //console.log("precheck==============:P"+GLOBAL.BASE_URL + attrs.sajaxsource)                        
                        var preInitCheck = GLOBAL.BASE_URL + attrs.sajaxsource;
                        var n = preInitCheck.search("/BindQuoteDetailsbyQuoteId");
                        if (n > -1) {
                            //quoteconsole page
                            var QuoteConsoleFullQuote = "fullQuoteDefault";
                            initDataTable(resp.data, QuoteConsoleFullQuote);
                        }
                        else {
                            // quoteList page
                            initDataTable(resp.data);
                        }

                    });

                    $scope.checkTable = function() {
                        $http.get(GLOBAL.BASE_URL + attrs.sajaxsource).then(function(resp) {
                            resp = JSON.parse(resp.data.data);
                            if (resp.length == 0) {
                                $scope.getRowSize = false;
                            }
                            else {
                                $scope.getRowSize = true;
                            }
                            console.log("testScope");

                        });

                    }

                    $scope.disableDeleteQuoteConsole = function() {
                        $http.get(GLOBAL.BASE_URL + attrs.sajaxsource).then(function(resp) {
                            resp = JSON.parse(resp.data.data);
                            if (resp.length == 0) {
                                console.log("disabled");
                                $('.quoteConsoleDelete').addClass('disabled');
                            }
                            else {
                                console.log("Not disabled");
                                $('.quoteConsoleDelete').removeClass('disabled');
                            }
                        });

                    }


                    $scope.deleteClick = function() {
                        var quoteIds = [];
                        $table.find('.deleteCheckbox:checked').each(function() {
                            quoteIds.push($(this).val());
                        });

                        if (quoteIds != '') {

                            var retVal = confirm("Do you want to Delete ?");
                            if (retVal == true) {
                                $.post(GLOBAL.BASE_URL + attrs.deleteurl, {quoteList: quoteIds.join(','), Token: storageEngine.authToken}, function(resp) {

                                    $table.dataTable().fnDestroy();
                                    initDataTable(resp);


                                }, 'json');
                            }
                        }
                        else {
                            alert("Please select any value");
                        }

                    };

                    $scope.deletePartDetails = function() {
                        var QuoteDetaillist = [];
                        $table.find('.deleteCheckbox:checked').each(function() {
                            QuoteDetaillist.push($(this).val());
                        });

                        if (QuoteDetaillist != '') {
                            var retVal = confirm("Do you want to Delete ?");
                            if (retVal == true) {
                                $.post(GLOBAL.BASE_URL + attrs.deleteurl, {QuoteDetaillist: QuoteDetaillist.join(','), QuoteId: $scope.quoteId, Token: storageEngine.authToken}, function(resp) {

                                    $table.dataTable().fnDestroy();
                                    initDataTable(resp);
                                }, 'json');
                            }
                        }
                        else {
                            alert("Please select any value");
                        }

                    };


                    $scope.selectStatusTypeSelectBox = function(value) {

                        if (!value) {
                            value = 0;
                        }
                        var token = storageEngine.authToken;
                        $http.get(GLOBAL.BASE_URL + "quote/GetAllQuote?Filter=" + value + "&Token=" + token).then(function(resp) {
                            $table.dataTable().fnDestroy();
                            initDataTable(resp.data);
                        }, 'json');

                    }



                    $scope.refreshDirective = function() {

                        $http.get(GLOBAL.BASE_URL + attrs.sajaxsource).then(function(resp) {
                            //console.log("resp::::::::"+JSON.stringify(resp));
                            $table.dataTable().fnDestroy();
                            initDataTable(resp.data);
                        }, 'json');
                    }

                    $scope.partDetailOnChange = function() {
                        $http.get(GLOBAL.BASE_URL + attrs.sajaxsource).then(function(resp) {
                            $table.dataTable().fnDestroy();
                            initDataTable(resp.data);
                        });
                    }


                    $scope.PartList = function(partId) {

                        $scope.isAddNew = false;
                        $scope.partId = partId;
                        ngDialog.open({template: 'partials/quotes/partDetail.html', scope: $scope, closeByDocument: false});


                    };
                    $scope.addNewPartDetails = function() {
                        if ($scope.redirectToPartDetail != true) {
                            $scope.saveNewDetails();
                        }
                        if ($scope.redirectToPartDetail === true) {
                            $scope.isAddNew = true;
                            ngDialog.open({template: 'partials/quotes/partDetail.html', scope: $scope, closeByDocument: false});
                        }

                    }

                    $scope.refreshDiv = function() {
                        alert(' ngDialog.outerHTML-->>');
                    }

                    //----------------------------------Quick quote-------------------------------------            
                    $scope.quickQuoteSelect = function() {
                        $http.get(GLOBAL.BASE_URL + attrs.sajaxsource).then(function(resp) {
                            $('.tab li a').removeClass('active');
                            $('.quick').addClass('active');
                            $table.dataTable().fnDestroy();
                            var quickQuote = "quickQuote";
                            $scope.QuoteType = false;
                            initDataTable(resp.data, quickQuote);
                        });
                    }
                    $scope.fullQuoteSelect = function() {
                        $http.get(GLOBAL.BASE_URL + attrs.sajaxsource).then(function(resp) {
                            $('.tab li a').removeClass('active');
                            $('.full').addClass('active');
                            var fullQuote = "fullQuote";
                            $scope.QuoteType = true;
                            $table.dataTable().fnDestroy();
                            initDataTable(resp.data, fullQuote);
                        });
                    }

                    function initDataTable(resp, optionalParam) {
                        var data = [], columns = [], dataSet = resp;
                        dataSet.data = JSON.parse(resp.data);
                        console.log("optional parameters " + optionalParam);
                        if (attrs.editurl) {
                            columns.push({title: ''});
                        }

                        var sortQuoteList;
                        dataSet.columns.forEach(function(columnObject) {

                            if (columnObject.Id === "status") {
                                columnObject.IsVisible = true;
                                sortQuoteList = "sortingQuoteList";
                            }

                            if (columnObject.IsVisible) {
                                columns.push({
                                    title: columnObject.Caption,
                                    id: columnObject.Id,
                                    ShowInfo: columnObject.ShowInfo,
                                    KeyField: columnObject.KeyField,
                                    ShowLink: columnObject.ShowLink,
                                    Href: columnObject.Href,
                                    DataType: columnObject.DataType
                                });
                            }
                            if (columnObject.IsPrimaryKey) {
                                primaryKeyColumnObject = columnObject;
                            }
                        });
                        columns.push({title: ''});

                        dataSet.data.forEach(function(quote) {
                            var dataRowArray = [], editUrl;

                            if (attrs.editurl) {
                                //   if (quote['statusdesc'] === 'Open') {
                                editUrl = '<a class="td_edit" href="#quoteConsole/' + quote[primaryKeyColumnObject.Id] + '"></a>';
                                /*  } else { 
                                 editUrl = '<a href="javascript:void(0)">Edit</a>';
                                 } */

                                dataRowArray.push(editUrl);
                            }

                            columns.forEach(function(columnObject) {
                                if (columnObject.id) {
                                    var data;

                                    if (columnObject.ShowInfo) {
                                        data = "<span class='left'>" + quote[columnObject.id];
                                        data += '</span><span class="showInfo left right icons-normal icons-info_grid" data-key="' +
                                                columnObject.KeyField +
                                                '" data-value="' +
                                                quote[columnObject.KeyField] + '"></span>';
                                    } else if (columnObject.ShowLink) {
                                        data = "<a class='href' data-Href='" +
                                                columnObject.Href + "' data-value='" +
                                                quote[columnObject.KeyField] + "'>" +
                                                quote[columnObject.id] + "</a>";
                                    } else if (columnObject.DataType === 'Date') {
                                        if (quote[columnObject.id] == "/Date(-2209008600000)/") {
                                            data = '';
                                        }
                                        else {
                                            data = dateConvertion(quote[columnObject.id]);
                                        }
                                    }
                                    else if (columnObject.title === "Status") {
                                        if (quote.statusdesc == "Draft") {
                                            data = "<span class='Grey'>" + quote[columnObject.id] + "</span>"
                                        }
                                        else if (quote.statusdesc == "Pending Approval") {
                                            data = "<span class='Blue'>" + quote[columnObject.id] + "</span>"
                                        }
                                        else if (quote.statusdesc == "Approved") {
                                            data = "<span class='Orange'>" + quote[columnObject.id] + "</span>"
                                        }
                                        else if (quote.statusdesc == "Rework") {
                                            data = "<span class='Red'>" + quote[columnObject.id] + "</span>"
                                        }
                                        else if (quote.statusdesc == "Submitted") {
                                            data = "<span class='LightGreen'>" + quote[columnObject.id] + "</span>"
                                        }
                                        else if (quote.statusdesc == "SubmittedWon") {
                                            data = "<span class='LightGreen'>" + quote[columnObject.id] + "</span>"
                                        }
                                        else if (quote.statusdesc == "SubmittedLost") {
                                            data = "<span class='LightGreen'>" + quote[columnObject.id] + "</span>"
                                        }
                                        else if (quote.statusdesc == "Discard") {
                                            data = "<span class='Violet'>" + quote[columnObject.id] + "</span>"
                                        }
                                        else {
                                            data = "<span class='Black'>" + quote[columnObject.id] + "</span>"
                                        }
                                    }


                                    else if (columnObject.DataType === "Float") {
                                        data = "<span class='text-align_right width_fix left '>" + quote[columnObject.id] + "</span>"
                                    }

                                    else
                                    {
                                        data = quote[columnObject.id];

                                    }
                                    dataRowArray.push(data);
                                }
                            });

                            if (quote['statusdesc'] === 'Draft') {
                                dataRowArray.push('<input type="checkbox" value="' + quote[primaryKeyColumnObject.Id] + '" class="deleteCheckbox" style="text-align: center"/>');
                            }
                            else if (quote['statusdesc']) {
                                dataRowArray.push('<input type="checkbox" value="' + quote[primaryKeyColumnObject.Id] + '" class="deleteCheckbox" disabled style="text-align: center"/>');
                            }
                            else {
                                dataRowArray.push('<input type="checkbox" value="' + quote[primaryKeyColumnObject.Id] + '" class="deleteCheckbox" style="text-align: center"/>');
                            }

                            data.push(dataRowArray);
                        });


                        var quoteConsolePage = optionalParam;


                        var dt_aoColumnDefs, dt_order, dt_initLoadData;

                        if (sortQuoteList == "sortingQuoteList") {
                            dt_aoColumnDefs = [{"aTargets": [0], "bSortable": false},
                                {"sWidth": "35px", "aTargets": [7], "bSortable": false},
                                {"aTargets": [6], "visible": false},
                                {"aTargets": [2], "sWidth": "100px"},
                                {"aTargets": [5], "sWidth": "100px"},
                                {"aTargets": [3], "sWidth": "100px"},
                                {"aTargets": [4], "sWidth": "100px"},
                                {"aTargets": [1], "sWidth": "100px"},
                                {"aTargets": [0], "sWidth": "10px"}];
                            dt_order = [[6, "asc"]];
                            dt_initLoadData = 20;
                        }
                        //quickQuote
                        else if (quoteConsolePage == "quickQuote") {
                            dt_aoColumnDefs = [{"aTargets": [3], "visible": false},
                                {"aTargets": [4], "visible": false},
                                {"aTargets": [5], "visible": false},
                                {"aTargets": [0], "sWidth": "100px"},
                                {"aTargets": [2], "sWidth": "100px"},
                                {"aTargets": [9], "bSortable": false}
                            ];
                            dt_order = [];
                            dt_initLoadData = 10;
                        }

                        //fullquote
                        else if (quoteConsolePage == "fullQuoteDefault" || quoteConsolePage == "fullQuote") {
                            dt_aoColumnDefs = [{"aTargets": [9], "bSortable": false}
                            ];
                            dt_initLoadData = 10;
                        }
                        else {
                            dt_aoColumnDefs = [{}];
                            dt_order = [];
                        }


                        $table.dataTable({
                            data: data,
                            columns: columns,
                            aoColumnDefs: dt_aoColumnDefs,
                            order: dt_order,
                            iDisplayLength: dt_initLoadData,
                            aLengthMenu: [10, 20, 30],
                        });

                    }

                    $table.on('mouseover', '.showInfo', function(event) {


                        var custId = $(this).attr('data-value'), that = this;
                        var data = {
                            CustomerID: custId,
                            Token: storageEngine.authToken
                        };
                        $.get(GLOBAL.BASE_URL + "/Quote/GetCustomerInfobyId", data, function(result) {

                            $(that).qtip({
                                overwrite: false,
                                content: function() {

                                    var content = 'Name :' + result.Name + '</br>';
                                    content += 'Phone :' + result.Phone + '</br>';
                                    content += 'Email :' + result.Email + '</br>';
                                    return content;
                                },
//                                position: {
//                                    my: 'right center',
//                                    at: 'left center',
//                                    target: $('td:eq(1)', this),
//                                    viewport: $table
//                                },
                                show: {
                                    event: event.type,
                                    ready: true
                                },
                                hide: {
                                    //fixed: true
                                }
                            }, event); // Note we passed the event as the second argument. Always do this when binding within an event handler!

                        }, 'json');
                    });

                    $table.on('click', '.href', function() {
                        $scope[$(this).attr('data-Href')]($(this).attr('data-value'));
                    });


                    function dateConvertion(value) {
                        var pattern = /Date\(([^)]+)\)/;
                        var results = pattern.exec(value);
                        var dt = new Date(parseFloat(results[1]));
                        var month = dt.getMonth() + 1;
                        var date = dt.getDate();
                        var year = dt.getFullYear();
                        if (month <= 9) {
                            month = "0" + month;
                        }
                        if (date <= 9) {
                            date = "0" + date;
                        }

                        //return (dt.getMonth() + 1) + "/" + dt.getDate() + "/" + dt.getFullYear();
                        return month + "/" + date + "/" + year;
                    }




                }
            };
        })
        .directive('keyboardPoster', function($parse, $timeout) {
            var DELAY_TIME_BEFORE_POSTING = 0;
            return function(scope, elem, attrs) {

                var element = angular.element(elem)[0];
                var currentTimeout = null;

//                element.oninput = function() {
//                    var model = $parse(attrs.postFunction);
//                    var poster = model(scope);
//
//                    if (currentTimeout) {
//                        $timeout.cancel(currentTimeout);
//                    }
//                    currentTimeout = $timeout(function() {
//                        bindPartData(angular.element(element).val());
//                        
//                    }, DELAY_TIME_BEFORE_POSTING);
//                };
            };

            //function bindPartData(val) {              
            //console.log(val);
            //}
        })
        .directive('numbersOnly', function() {
            return {
                require: 'ngModel',
                link: function(scope, element, attrs, modelCtrl) {
                    modelCtrl.$parsers.push(function(inputValue) {
                        // this next if is necessary for when using ng-required on your input. 
                        // In such cases, when a letter is typed first, this parser will be called
                        // again, and the 2nd time, the value will be undefined
                        if (inputValue == undefined)
                            return ''
                        var transformedInput = inputValue.replace(/[^\d.\',']/g, '');

                        var point = transformedInput.indexOf(".");
                        if (point >= 0) {
                            transformedInput = transformedInput.slice(0, point + 3);
                        }

                        if (transformedInput != inputValue) {
                            modelCtrl.$setViewValue(transformedInput);
                            modelCtrl.$render();
                        }

                        var decimalSplit = transformedInput.split(".");
                        var intPart = decimalSplit[0];
                        var decPart = decimalSplit[1];


                        intPart = intPart.replace(/[^\d]/g, '');
                        if (intPart.length > 3) {
                            var intDiv = Math.floor(intPart.length / 3);
                            while (intDiv > 0) {
                                var lastComma = intPart.indexOf(",");
                                if (lastComma < 0) {
                                    lastComma = intPart.length;
                                }

                                if (lastComma - 3 > 0) {
                                    intPart = intPart.slice(0, lastComma - 3) + "," + intPart.slice(lastComma - 3);
                                }
                                intDiv--;
                            }
                        }

                        if (decPart === undefined) {
                            decPart = "";
                        }
                        else {
                            decPart = "." + decPart;
                        }


                        var res = intPart + decPart;


                        if (res != transformedInput) {
                            modelCtrl.$setViewValue(res);
                            modelCtrl.$render();
                        }

                        return transformedInput;
                    });
                }
            };
        })

        .directive('quantity', function() {
            return {
                require: 'ngModel',
                link: function(scope, element, attrs, modelCtrl) {
                    modelCtrl.$parsers.push(function(inputValue) {
                        // this next if is necessary for when using ng-required on your input. 
                        // In such cases, when a letter is typed first, this parser will be called
                        // again, and the 2nd time, the value will be undefined
                        if (inputValue == undefined)
                            return ''
                        var transformedInput = inputValue.replace(/[^0-9]/g, '');
                        if (transformedInput != inputValue) {
                            modelCtrl.$setViewValue(transformedInput);
                            modelCtrl.$render();
                        }

                        return transformedInput;
                    });
                }
            };
        })
        .directive('currencyInput', function() {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, element, attrs, ctrl) {

                    return ctrl.$parsers.push(function(inputValue) {
                        var inputVal = element.val();

                        //clearing left side zeros
                        while (inputVal.charAt(0) == '0') {
                            inputVal = inputVal.substr(1);
                        }

                        inputVal = inputVal.replace(/[^\d.\',']/g, '');

                        var point = inputVal.indexOf(".");
                        if (point >= 0) {
                            inputVal = inputVal.slice(0, point + 3);
                        }

                        var decimalSplit = inputVal.split(".");
                        var intPart = decimalSplit[0];
                        var decPart = decimalSplit[1];

                        intPart = intPart.replace(/[^\d]/g, '');
                        if (intPart.length > 3) {
                            var intDiv = Math.floor(intPart.length / 3);
                            while (intDiv > 0) {
                                var lastComma = intPart.indexOf(",");
                                if (lastComma < 0) {
                                    lastComma = intPart.length;
                                }

                                if (lastComma - 3 > 0) {
                                    intPart = intPart.slice(0, lastComma - 3) + "," + intPart.slice(lastComma - 3);
                                }
                                intDiv--;
                            }
                        }

                        if (decPart === undefined) {
                            decPart = "";
                        }
                        else {
                            decPart = "." + decPart;
                        }
                        var res = intPart + decPart;

                        if (res != inputValue) {
                            ctrl.$setViewValue(res);
                            ctrl.$render();
                        }

                    });

                }
            };
        });

