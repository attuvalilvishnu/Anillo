'use strict';
(function(angular) {
    angular.module('myApp.controllers', ['ngDialog'])

            .controller('LoginController', function($scope, $location, $http) {
                $scope.loginToken = storageEngine.authToken;
                $scope.isValidUser = false;
                $scope.displayname = 'User Name';
                $scope.displaypassword = '********';
                $scope.credentials = {
                    username: '',
                    password: ''
                };

                $scope.login = function(credentials) {
                    console.log('logIn called--->');
                    $.post(GLOBAL.BASE_URL + 'login/login', credentials, function(resp) {
                        console.log(resp, '<<<resp');
                        if (resp.Token !== "0" && resp.Status === 1) {
                            console.log('-->>', credentials, resp);
                            $scope.isValidUser = true;
//                            if ($scope.isChecked) {
//                                storageEngine = localStorage;
//                            } else {
//                                storageEngine = sessionStorage;
//                            }
                            storageEngine.authToken = resp.Token;
                            $('.log_wrap').hide();
                            $('.bg_image').hide();
                            $('.log-header_wrap').hide();

                            // RoleId = resp.RoleId;
                            //userName = resp.UserName;

                            storageEngine.RoleId = resp.RoleId;
                            storageEngine.userName = resp.UserName;

                            window.location.hash = '/quotes';
                            console.log(storageEngine.authToken, '<---authToken');
                        } else {
                            alert('Invalid Login');
                            //localStorage.clear();
                        }
                    }, 'json');
                };

            })
            .controller('QuoteConsoleController', function($scope, $http, $routeParams, ngDialog) {
                $scope.quoteId = $routeParams.Id;
                $scope.ValidCustomerName = true;
                $scope.loginToken = storageEngine.authToken;
                $scope.RoleId = storageEngine.RoleId;
                $scope.userName = storageEngine.userName;
                $scope.setContact = true;
                var id = $routeParams.Id;
                var custDetails;
                var SalesPersonId;
                var Source;
                var QuoteCommentsList;
                var contactList;
                var custid;
                var statusScope;




                $scope.getQuoteConsoleDetailsById = function() {

                    $http.get(GLOBAL.BASE_URL + "Quote/GetQuotebyId?QuoteID=" + id + "&Token=" + storageEngine.authToken).success(function(resp) {
                        console.log(resp);
                        console.log("******************");
                        SalesPersonId = resp.SalesPersonId;
                        Source = resp.Source;
                        console.log(resp.Status);
                        $scope.setNewStatus(resp.Status);
                        custid = resp.CustomerId;
                        $scope.QuoteNo = resp.QuoteNo;
                        $scope.customerName = resp.CustomerName;
                        $scope.quoteComments = resp.QuoteComments;
                        $scope.totalCost = "$ " + resp.TotalCost;
                        $scope.QuoteType = resp.QuoteType;



                        statusScope = resp.Status;
                        $scope.disablebutton(resp.Status);
                        $('.button_common').removeClass('disable');
                        if ($scope.RoleId == 1) {
                            if (resp.Status == 1 || resp.Status == 6) {
                                $('.submitForApprovalButton').show();
                            }
                        }

                        if ($scope.RoleId == 2) {
                            if (resp.Status == 2) {
                                $('.pendingApproval').show();
                                $('.RejectButton').show();
                                $('.CancelButton').show();
                            }
                        }
                        $scope.disableDeleteQuoteConsole();

                    });


                }

                $scope.getQuoteConsoleDetailsById();




                /**************** Tool Tip  *************************************************************************/

                $('.showCustDetails').on('mouseover', function() {
                    var that = this;
                    var data = {
                        CustomerID: custid,
                        Token: storageEngine.authToken
                    };
                    $.get(GLOBAL.BASE_URL + "/Quote/GetCustomerInfobyId", data).success(function(resp) {
                        resp = JSON.parse(resp);
                        console.log(resp);
                        $(that).qtip({
                            overwrite: true,
                            content: function() {

                                var content = 'Name :' + resp.Name + '</br>';
                                content += 'Phone :' + resp.Phone + '</br>';
                                content += 'Email :' + resp.Email + '</br>';
                                return content;
                            },
                            show: {
                                ready: true
                            },
                            hide: {
                                fixed: true
                            }
                        });

                    }, 'json');

                });

                /*******************************End************************************************************/



                $('.user_name').on('click', function() {
                    console.log("check")
                    $('.dropmenu').toggle();
                });






                /******* Set New Status*********************************************************************/

                $scope.setNewStatus = function(Status) {
                    $('.status').removeClass('Grey');
                    $('.status').removeClass('Blue');
                    $('.status').removeClass('Orange');
                    $('.status').removeClass('Violet');
                    $('.status').removeClass('LightGreen');
                    $('.status').removeClass('Red');

                    switch (Status) {

                        case 1:
                            $scope.status = "Draft";
                            $('.status').addClass('Grey');
                            break;
                        case 2:
                            $scope.status = "Pending Approval";
                            $('.status').addClass('Blue');
                            break;
                        case 3:
                            $scope.status = "Approved";
                            $('.status').addClass('Orange');
                            break;
                        case 4:
                            $scope.status = "Discard";
                            $('.status').addClass('Violet');
                            break;
                        case 5:
                            $scope.status = "Submitted";
                            $('.status').addClass('LightGreen');
                            break;
                        case 17:
                            $scope.status = "Submitted Won";
                            $('.status').addClass('LightGreen');
                            break;

                        case 18:
                            $scope.status = "Submitted Lost";
                            $('.status').addClass('LightGreen');
                            break;


                        case 15:
                            $scope.status = "Rework";
                            $('.status').addClass('Red');
                            break;

                    }
                    console.log($scope.status);

                }

                /*************************************End******************************************/

                /*********************** Ajax request based on roles ****************************************/

                $scope.submitForApproval = function() {
                    console.log($scope.customerName);
                    if ($scope.customerName != '' && $scope.ValidCustomerName == true && $scope.setContact == true) {
                        $http.get(GLOBAL.BASE_URL + "Quote/SubmitQuote?quoteId=" + $scope.quoteId + "&&Token=" + storageEngine.authToken).success(function(resp) {
                            console.log(resp);
                            if (resp.QuoteStatus) {
                                $scope.setNewStatus(resp.QuoteResult);
                                $('.submitForApprovalButton').find('.button_common').addClass('disable');

                            }
                        });
                    }
                    else {
                        alert("Enter Valid Details");
                    }

                }

                $scope.pendingApproval = function() {


                    if ($scope.customerName != '' && $scope.ValidCustomerName == true && $scope.setContact == true) {
                        $http.get(GLOBAL.BASE_URL + "Quote/ApproveQuote?quoteId=" + $scope.quoteId + "&&Token=" + storageEngine.authToken).success(function(resp) {

                            if (resp.QuoteStatus) {
                                $scope.setNewStatus(resp.QuoteResult);

                            }

                        });
                    }
                    else {
                        alert("Enter Valid Details");
                    }

                }


                $scope.Reject = function() {
                    if ($scope.customerName != '' && $scope.ValidCustomerName == true && $scope.setContact == true) {
                        $http.get(GLOBAL.BASE_URL + "Quote/RejectQuote?quoteId=" + $scope.quoteId + "&&Token=" + storageEngine.authToken).success(function(resp) {
                            console.log(resp);
                            if (resp.QuoteStatus) {
                                $scope.setNewStatus(resp.QuoteResult);

                            }

                        });
                    }
                    else {
                        alert("Enter Valid Details");
                    }
                }

                $scope.Cancel = function() {
                    if ($scope.customerName != '' && $scope.ValidCustomerName == true && $scope.setContact == true) {
                        $http.get(GLOBAL.BASE_URL + "Quote/CancelQuote?quoteId=" + $scope.quoteId + "&&Token=" + storageEngine.authToken).success(function(resp) {
                            console.log(resp);
                            if (resp.QuoteStatus) {
                                $scope.setNewStatus(resp.QuoteResult);
                            }

                        });
                    }
                    else {
                        alert("Enter Valid Details");
                    }
                }

                $scope.GenerateMail = function() {

                    if ($scope.customerName != '' && $scope.ValidCustomerName == true && $scope.setContact == true) {
                        ngDialog.open({template: 'partials/quotes/previewPage.html',
                            scope: $scope,
                            controller: 'QuoteConsoleController'
                        });

                    }
                    else {
                        alert("Enter Valid Details");
                    }

                }


                $scope.showsendEmailPopup = function() {

                    var content = "quoteId=" + $scope.quoteId + "&&Token=" + storageEngine.authToken
                    $http.get(GLOBAL.BASE_URL + "Quote/CreateMailType?" + content).success(function(resp) {
                        console.log(resp);
                        $scope.sendTo = resp.MailTo;
                        $scope.sendSubject = resp.MailBody;
                        $scope.sendBody = resp.mailSubject;


                    });



                    if ($scope.customerName != '' && $scope.ValidCustomerName == true && $scope.setContact == true) {
                        ngDialog.open({template: 'partials/quotes/generateEmail.html',
                            scope: $scope,
                            controller: 'QuoteConsoleController'
                        });

                    }
                    else {
                        alert("Enter Valid Details");
                    }


                }




                $scope.sendMail = function() {

                    if ($scope.sendTo != '' && $scope.sendSubject != '' && $scope.sendBody != '') {

                        var MailTo = $scope.sendTo;
                        var MailBody = $scope.sendSubject;
                        var MailSubject = $scope.sendBody;
                        var content = "quoteId=" + $scope.quoteId + "&&Token=" + storageEngine.authToken + "&&MailTo=" + MailTo + "&&MailBody=" + MailBody + "&&MailSubject=" + MailSubject
                        $http.get(GLOBAL.BASE_URL + "Quote/GenerateMail?" + content).success(function(resp) {
                            console.log(resp);
                            if (resp.QuoteStatus) {
                                $scope.setNewStatus(resp.QuoteResult);
                                ngDialog.close();
                                $scope.getQuoteConsoleDetailsById();

                            }
                        });
                    }
                    else {
                        alert("Please enter Valid Details");
                    }

                }

                $scope.previewPagePopup = function() {
                    ngDialog.close();
                }

                $scope.closeEmailPopup = function() {
                    ngDialog.close();
                }

                /**************************** End ******************************************************/

                $scope.disablesubmitForApproval = function() {
                    if ($scope.status === 'Pending Approval') {
                        return true;
                    }

                }

                $scope.disable = function() {
                    if ($scope.status === 'Approved' || $scope.status === 'Rejected' || $scope.status === 'Cancelled') {
                        $('.pendingApproval').find('.button_common').addClass('disable');
                        $('.RejectButton').find('.button_common').addClass('disable');
                        $('.CancelButton').find('.button_common').addClass('disable');
                        if ($scope.status === 'Approved') {
                            $('.GenerateMailButton').show();
                            $('.pendingApproval').hide();
                            $('.RejectButton').hide();
                            $('.CancelButton').hide();
                            $('.disableSave').removeClass('disabled');
                            $('.disableDelete').removeClass('disabled');
                        }
                        return true;
                    }
                }



                $scope.disablebutton = function(statusScope) {


                    if (statusScope == 2 || statusScope == 3 || statusScope == 4 || statusScope == 5) {
                        console.log("Disable Save");
                        $('.disableSave').addClass('disabled');
                    }
                    if (statusScope != 1) {
                        console.log("Disable Delete")
                        $('.disableDelete').addClass('disabled');
                    }

                }


                /************************** Quote Console Basic Functionality **********************************/

                $http.get(GLOBAL.BASE_URL + "Quote/BindQuoteHeaderDropDown" + "?Token=" + storageEngine.authToken).success(function(data) {
                    console.log(data);
                    custDetails = data.Customer;
                    QuoteCommentsList = data.QuoteComments;
                    contactList = data.Contact;

                    data.User.forEach(function(data) {
                        if (data.Key === SalesPersonId) {
                            $scope.InitialSalesList = data;
                        }

                    });
                    $scope.salesList = data.User;


                    data.Source.forEach(function(data) {
                        if (data.Key === Source) {
                            $scope.initialSourceList = data;
                        }

                    });
                    $scope.SourceList = data.Source;


                    $scope.customerList = data.Customer;

                    var arr = [];
                    data.Contact.forEach(function(data) {
                        if (custid === data.ParentKey) {
                            if (data.IsDefault === true) {
                                $scope.initialContact = data;
                            }
                            arr.push(data);
                        }


                    });
                    $scope.Contact = arr;
                    $scope.QuoteCommentsList = QuoteCommentsList;

                    if ($scope.QuoteType === true) {

                        $scope.fullQuoteSelect();
                    }

                    else {
                        $scope.quickQuoteSelect();
                    }

                }, 'json');


                $scope.changeContact = function(customer) {
                    console.log(customer);
                    custid = customer.Key;
                    $('.showAvailableCustomers').hide();
                    $scope.customerName = customer.Text;

                    var arr = [];
                    contactList.forEach(function(data) {
                        if (data.ParentKey === customer.Key) {
                            if (data.IsDefault === true) {
                                $scope.initialContact = data;
                            }
                            arr.push(data);
                        }
                    })
                    $scope.Contact = arr;
                    $scope.ValidCustomerName = true;
                    console.log(arr);
                    if (arr == '') {
                        $scope.setContact = false;
                    }
                    else {
                        $scope.setContact = true;
                    }


                }

                $scope.keyPressed = function(custname) {
                    $scope.ValidCustomerName = false;

                    custDetails.forEach(function(data) {

                        if (data.Text == custname) {
                            $scope.ValidCustomerName = true;
                        }

                    });


                }

                $scope.showQuoteCommentPopup = function() {
                    $('.QuoteCommentPopup').show();

                }

                $scope.setNewQuoteComment = function(selectedComment) {
                    $scope.quoteComments = selectedComment.Text;
                    $('.QuoteCommentPopup').hide();
                }
                $scope.closePopUp = function() {
                    $('.QuoteCommentPopup').hide();
                }

                /****************************** END *******************************************************/



                /******************************* Save********************************************************/
                //  $scope.QuoteType = true;

                $scope.saveNewDetails = function() {
                    $scope.redirectToPartDetail = true;
                }

                $scope.saveDetails = function() {

                    console.log(storageEngine.authToken);
                    var obj = {};
                    obj.QuoteNo = $scope.QuoteNo;
                    obj.QuoteId = $scope.quoteId;
                    obj.Token = storageEngine.authToken;
                    obj.RfqId = 1;
                    obj.CustomerId = custid;
                    obj.StatusId = 1;
                    obj.SalesPersonId = $scope.InitialSalesList.Key;
                    obj.ContactId = $scope.initialContact.Key;
                    obj.SourceId = $scope.initialSourceList.Key;
                    obj.CustomerName = $scope.customerName;
                    obj.QuoteComments = $scope.quoteComments;
                    obj.QuoteType = $scope.QuoteType;
                    console.log(obj.QuoteType);
                    console.log(obj);


                    $scope.checkTable();



                    if ($scope.customerName != '' && $scope.ValidCustomerName == true && $scope.setContact == true) {

                        $http({
                            method: 'POST',
                            url: GLOBAL.BASE_URL + "Quote/SaveQuote",
                            data: $.param(obj),
                            headers: {'content-type': 'application/x-www-form-urlencoded'}
                        }).success(function(resp) {


                            if (resp.SaveStatus == true) {
                                if ($scope.getRowSize == false) {
                                    var retVal = confirm("Do you want to save without part details ?");
                                    if (retVal == true) {
                                        alert("Saved Successfully");
                                        window.location.hash = '/quotes';
                                    }
                                }
                                else {
                                    alert("Saved Successfully");
                                    window.location.hash = '/quotes';
                                }

                            }

                        });
                    }

                    else {
                        alert("Please Enter Valid Customer Name");
                    }



                }

//**************************END*******************************************************************//

//**************************COPY********************************************************//
                $scope.copyDetails = function() {

                    $http({method: 'GET', url: GLOBAL.BASE_URL + "Quote/CopyQuote?QuoteId=" + $scope.quoteId + "&Token=" + storageEngine.authToken,
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    }).success(function(resp) {
                        console.log(resp);
                        $scope.QuoteNo = resp.QuoteHeadr.QuoteNo;
                        $scope.quoteId = resp.QuoteHeadr.QuoteId;
                        $scope.status = "Draft";
                        $('.disableSave').removeClass('disabled');
                        $('.disableDelete').removeClass('disabled');
                        console.log($scope.status);
                    });

                }

                //*********************************END***************************************************//               

                $('.custName').on('keyup', function() {

                    $('.showAvailableCustomers').show();

                });


            })



            .controller('QuoteConsoleAddController', function($scope, $location, $http) {


                var custDetails;
                var QuoteCommentsList;
                var contactList;
                $scope.ValidCustomerName = true;
                $scope.loginToken = storageEngine.authToken;
                $scope.RoleId = storageEngine.RoleId;
                $scope.userName = storageEngine.userName;
                $scope.setContact = true;


                $.post(GLOBAL.BASE_URL + "Quote/addquote" + "?Token=" + storageEngine.authToken, function(resp) {
                    resp = JSON.parse(resp);
                    console.log(resp);
                    $scope.QuoteNo = resp;
                    $scope.status = "Draft";
                    $scope.disableDeleteQuoteConsole();

                });

                $http.get(GLOBAL.BASE_URL + 'Quote/BindQuoteHeaderDropDown' + "?Token=" + storageEngine.authToken).success(function(data) {
                    console.log(data);
                    custDetails = data.Customer;
                    QuoteCommentsList = data.QuoteComments;
                    contactList = data.Contact;


                    $scope.InitialSalesList = data.User[0];
                    $scope.salesList = data.User;



                    $scope.initialSourceList = data.Source[0];
                    $scope.SourceList = data.Source;


                    $scope.customerList = data.Customer;


                    $scope.initialContact = data.Contact[0];
                    $scope.Contact = data.Contact;

                    $scope.QuoteCommentsList = QuoteCommentsList;

                }, 'json');

                $scope.changeContact = function(customer) {
                    $('.showAvailableCustomers').hide();
                    $scope.customerName = customer.Text;

                    var arr = [];
                    contactList.forEach(function(data) {
                        if (data.ParentKey === customer.Key) {
                            if (data.IsDefault === true) {
                                $scope.initialContact = data;
                            }
                            arr.push(data);
                        }
                    })
                    $scope.Contact = arr;
                    $scope.ValidCustomerName = true;
                    if (arr == '') {
                        $scope.setContact = false;
                    }
                    else {
                        $scope.setContact = true;
                    }


                }

                $scope.customerName = '';
                $scope.QuoteType = true;


                $scope.saveNewDetails = function() {
                    if ($scope.customerName != '' && $scope.ValidCustomerName == true && $scope.setContact == true) {
                        $scope.saveDetails();
                        //$scope.redirectToPartDetail = true;

                    }

                    else {
                        alert("please Enter Valid Details");
                        //$scope.redirectToPartDetail = false;
                    }


                }




                $scope.saveDetails = function() {

                    var obj = {};
                    obj.QuoteNo = $scope.QuoteNo;
                    obj.QuoteId = 0;
                    obj.Token = storageEngine.authToken;
                    obj.RfqId = 1;
                    obj.SalesPersonId = $scope.InitialSalesList.Key;
                    obj.ContactId = $scope.initialContact.Key;
                    obj.SourceId = $scope.initialSourceList.Key;
                    obj.CustomerName = $scope.customerName;
                    obj.QuoteComments = $scope.quoteComments;
                    obj.QuoteType = $scope.QuoteType;
                    console.log(obj.QuoteType);
                    console.log(obj);
                    $scope.checkTable();

                    if ($scope.customerName != '' && $scope.ValidCustomerName == true && $scope.setContact == true) {
                        $http({
                            method: 'POST',
                            url: GLOBAL.BASE_URL + "Quote/SaveQuote",
                            data: $.param(obj),
                            headers: {'content-type': 'application/x-www-form-urlencoded'}
                        }).success(function(resp) {
                            console.log(resp);
                            if (resp.SaveStatus == true) {
                                if ($scope.getRowSize == false) {
                                    var retVal = confirm("Do you want to save without part details?");
                                    if (retVal == true) {
                                        alert("Saved Successfully");
                                        window.location.hash = '/quotes';
                                    }
                                    else {
                                        $scope.redirectToPartDetail = true;
                                        $scope.addNewPartDetails();
                                    }
                                }
                                else {
                                    alert("Saved Successfully");
                                    window.location.hash = '/quotes';
                                }

                            }

                        });
                    }
                    else {
                        alert("Please Enter Valid Customer Name");
                    }


                }



                $scope.keyPressed = function(custname) {

                    $scope.ValidCustomerName = false;
                    custDetails.forEach(function(data) {

                        if (data.Text == custname) {
                            $scope.ValidCustomerName = true;
                        }

                    });

                }


                $scope.showQuoteCommentPopup = function() {
                    $('.QuoteCommentPopup').show();


                }

                $scope.setNewQuoteComment = function(selectedComment) {
                    $scope.quoteComments = selectedComment.Text;
                    $('.QuoteCommentPopup').hide();
                }

                $('.custName').on('keyup', function() {

                    $('.showAvailableCustomers').show();

                });



            })

            //quoteController
            .controller('quoteController', function($scope, $location, $http) {
                console.log(storageEngine.authToken);
                $scope.loginToken = storageEngine.authToken;
                $scope.userName = storageEngine.userName;
                console.log("username");
                console.log($scope.userName);
                $('.user_name').on('click', function() {
                    $('.dropmenu').toggle();
                });
                $scope.logout = function() {
                    storageEngine.authToken = '';
                    window.location.hash = '/';
                }


            })

               .controller('partDetailController', function($scope, $location, $element, $http, $routeParams, ngDialog) {
                var id = $routeParams.Id;
                $scope.selectedPartId = {};
                $scope.isAjaxLoaded = false;
                $scope.isDropDownLoaded = false;
                $scope.loginToken = storageEngine.authToken;
                $scope.active = true;
                $scope.orderHis = true;
                $scope.partInfoActive = false;
                $scope.attachMentActive = false;
                $scope.quoteDetails = {};
                $scope.quoteDetails.UomDescription = '';
                $scope.quoteDetails.LeadTime = '';
                $scope.quoteDetails.Discount = '';

                
                var isValidCustomerPn = false;
                var isValidAnilloPn = false;
                var isValidMaterialCost = false;
                var isValidLabourCost = false;
                var isValidProcessingCost = false;
                var isValidUnitPrice = false;
               


                var parseFloat2 = function(value) {
                    return (isNaN(parseFloat(value)) ? 0 : parseFloat(value));
                };

                $scope.closePopup = function() {
                    ngDialog.close();
                };

                $scope.accordionClick = function() {
                    $scope.active = !$scope.active;
                };

                $scope.accordionClick1 = function() {
                    $scope.partInfoActive = !$scope.partInfoActive;

                };

                $scope.accordionClick2 = function() {
                    $scope.orderHis = !$scope.orderHis;

                };

                $http({method: 'GET', url: GLOBAL.BASE_URL + 'Quote/BindQuoteDetailsDropDown?Token=' + $scope.loginToken}).success(function(data) {

                    $scope.UOM = data.UOM;
                    $scope.LeadTime = data.LeadTime;
                    $scope.Parts = data.Parts;

                    if ($scope.isAddNew) {
                        //$scope.quoteDetails.AnilloPn = $scope.Parts[0].Text;
                        //$scope.part_id = $scope.Parts[0].Key;
                        $scope.quoteDetails.MaterialCost = '$0.00';
                        $scope.quoteDetails.LabourCost = '$0.00';
                        $scope.quoteDetails.ProcessingCost = '$0.00';
                        $scope.quoteDetails.Quantity = 0;
                        $scope.quoteDetails.Discount = '0%';
                        $scope.quoteDetails.UnitPrice = '$0.00'
                       // $scope.partId = 0;
                        $scope.selectedLeadTime = $scope.LeadTime[0];
                        $scope.selectedUOM = $scope.UOM[0];
                        $scope.getUnitPrice();
                        $scope.calculateTotal();
                        
                        $scope.partDetailsId = $scope.part_id;
                        
                        $http({method: 'GET', url: GLOBAL.BASE_URL + 'Quote/GetAllPartDetailsByPartId?PartId=' + $scope.part_id + '&Token=' + storageEngine.authToken}).success(function(resp) {
                            $scope.partDetails = resp;
                            $scope.partDetails.Description = JSON.stringify($scope.partDetails.Description);
                          //  $scope.partDetailsId = $scope.part_id;
                            $scope.isAjaxLoaded = true;
                        });

                    } else {
                        console.log('elese >>>>' + $scope.quoteId);
                        $http({method: 'GET', url: GLOBAL.BASE_URL + 'Quote/GetQuoteDetailsbyId?QuoteDetailId=' + $scope.partId + '&Token=' + storageEngine.authToken}).success(function(response) {
                            $scope.quoteDetails = response;
                            $scope.partDetailsId = $scope.quoteDetails.PartId;
                            $scope.quoteDetails.MaterialCost = '$' + $scope.quoteDetails.MaterialCost;
                            $scope.quoteDetails.LabourCost = '$' + $scope.quoteDetails.LabourCost;
                            $scope.quoteDetails.ProcessingCost = '$' + $scope.quoteDetails.ProcessingCost;
                            $scope.quoteDetails.Discount = $scope.quoteDetails.Discount + '%';
                            $scope.getUnitPrice();
                            $scope.calculateTotal();
                            $.each($scope.LeadTime, function(index, value) {
                                if (value.Text === $scope.quoteDetails.LeadTime) {
                                    $scope.selectedLeadTime = $scope.LeadTime[index];
                                }
                                ;
                            });

                            $.each($scope.UOM, function(index, value) {
                                if (value.Text === $scope.quoteDetails.UomDescription) {
                                    $scope.selectedUOM = $scope.UOM[index];
                                }
                                ;
                            });


                            $.each($scope.Parts, function(index, value) {
                                if ($scope.quoteDetails.AnilloPn === value.Text) {
                                    $http({method: 'GET', url: GLOBAL.BASE_URL + 'Quote/GetAllPartDetailsByPartId?PartId=' + value.Key + '&Token=' + storageEngine.authToken}).success(function(resp) {
                                        $scope.partDetails = resp;
                                        $scope.partDetails.Description = JSON.stringify($scope.partDetails.Description);
                                        $scope.part_id = value.Key;
                                        $scope.isAjaxLoaded = true;
                                    });
                                }
                                ;
                            });
                        });
                    }



                });


                
                
                
                $scope.changePartDetail = function(val) {
                    $.each($scope.Parts, function(index, value) {
                        if ($scope.quoteDetails.AnilloPn === value.Text) {
                            $scope.partDetailOnChange();                            
                            $http({method: 'GET', url: GLOBAL.BASE_URL + 'Quote/GetAllPartDetailsByPartId?PartId=' + value.Key + '&Token=' + storageEngine.authToken}).success(function(resp) {
                                $scope.partDetails = resp;
                                $scope.partDetails.Description = JSON.stringify($scope.partDetails.Description);
                                $scope.part_id = value.Key;
                                $scope.partDetailsId = $scope.part_id;
                            });
                        }
                        ;
                    });
                };
                
                
                
                



                $scope.calculateTotal = function() {
                    if ($scope.quoteDetails.Discount) {
                        if ($scope.quoteDetails.Discount.indexOf('%') == -1) {
                            $scope.quoteDetails.Discount = $scope.quoteDetails.Discount + '%';
                        }
                    }
                    if($scope.QuoteType == true) {
                        $scope.quoteDetails.UnitPrice = parseFloat2($scope.quoteDetails.MaterialCost.replace(/[$]/gi, '')) + parseFloat2($scope.quoteDetails.LabourCost.replace(/[$]/gi, '')) + parseFloat2($scope.quoteDetails.ProcessingCost.replace(/[$]/gi, ''));
                         $scope.quoteDetails.UnitPrice = '$' + $scope.quoteDetails.UnitPrice.toFixed(2);
                    } else {
                         if($scope.quoteDetails.UnitPrice) {  
                               if ($scope.quoteDetails.UnitPrice.indexOf('$') == -1) {
                                  $scope.quoteDetails.UnitPrice = '$' + $scope.quoteDetails.UnitPrice;
                              }
                        }
                    }
                    $scope.quoteDetails.TotalCost = (parseFloat2($scope.quoteDetails.UnitPrice.replace(/[$]/gi, '')) * parseFloat2($scope.quoteDetails.Quantity));
                    $scope.quoteDetails.TotalCost -= $scope.quoteDetails.TotalCost * parseFloat2($scope.quoteDetails.Discount.replace(/[%]/gi, '')) / 100;

                   
                    $scope.quoteDetails.TotalCost = $scope.quoteDetails.TotalCost.toFixed(2);

                    if ($scope.quoteDetails.TotalCost < 0) {
                        $scope.quoteDetails.TotalCost = 0;
                    }
                };

                $scope.getUnitPrice = function() {                    
                    if($scope.QuoteType == true) {
                        if ($scope.quoteDetails.MaterialCost && $scope.quoteDetails.LabourCost && $scope.quoteDetails.ProcessingCost) {
                            $scope.quoteDetails.UnitPrice = parseFloat2($scope.quoteDetails.MaterialCost.replace(/[$]/gi, '')) + parseFloat2($scope.quoteDetails.LabourCost.replace(/[$]/gi, '')) + parseFloat2($scope.quoteDetails.ProcessingCost.replace(/[$]/gi, ''));
                            if ($scope.quoteDetails.MaterialCost.indexOf('$') == -1) {
                                $scope.quoteDetails.MaterialCost = '$' + $scope.quoteDetails.MaterialCost;
                            }

                            if ($scope.quoteDetails.LabourCost.indexOf('$') == -1) {
                                $scope.quoteDetails.LabourCost = '$' + $scope.quoteDetails.LabourCost;
                            }

                            if ($scope.quoteDetails.ProcessingCost.indexOf('$') == -1) {
                                $scope.quoteDetails.ProcessingCost = '$' + $scope.quoteDetails.ProcessingCost;
                            }
                             if ($scope.quoteDetails.UnitPrice) {                              
                                 $scope.quoteDetails.UnitPrice = '$' + $scope.quoteDetails.UnitPrice.toFixed(2);                               
                            }



                            $scope.calculateTotal();
                        } 
                    } else {
                        
                        if($scope.quoteDetails.UnitPrice) {
                             if ($scope.quoteDetails.UnitPrice.indexOf('$') == -1) {
                               $scope.quoteDetails.UnitPrice = '$' + $scope.quoteDetails.UnitPrice;
                            }
                             console.log($scope.quoteDetails.UnitPrice, '<---$scope.quoteDetails.UnitPrice')
                            $scope.calculateTotal();
                        }
                    }
                    




                }

                $scope.saveClick = function() {

                    if ($scope.isAjaxLoaded) {
                        var saveObj = {};

                        saveObj.QuoteId = $scope.quoteId;
                        saveObj.QuoteDetlId = $scope.partId;
                        saveObj.CustomerPn = $scope.quoteDetails.CustomerPn;
                        saveObj.AnilloPn = $scope.quoteDetails.AnilloPn;
                        saveObj.Quantity = $scope.quoteDetails.Quantity;
                        saveObj.UomDescription = $scope.selectedUOM.Text;
                        saveObj.MaterialCost = $scope.quoteDetails.MaterialCost.replace(/[$]/gi, '');
                        saveObj.LabourCost = $scope.quoteDetails.LabourCost.replace(/[$]/gi, '');
                        saveObj.ProcessingCost = $scope.quoteDetails.ProcessingCost.replace(/[$]/gi, '');
                        saveObj.UnitPrice = $scope.quoteDetails.UnitPrice.replace(/[$]/gi, '');
                        saveObj.LeadTime = $scope.selectedLeadTime.Text;
                        saveObj.Discount = $scope.quoteDetails.Discount.replace(/[%]/gi, '');
                        saveObj.ItemNotes = $scope.quoteDetails.ItemNotes;
                        saveObj.Token = $scope.loginToken;

                        console.log('discount--->>' + $scope.quoteDetails.Discount.replace(/[%]/gi, ''));
                        if ($scope.quoteDetails.CustomerPn) {

                            isValidCustomerPn = true;
                        }

                        if ($scope.quoteDetails.AnilloPn) {

                            isValidAnilloPn = true;
                        }

                        if ($scope.quoteDetails.MaterialCost) {

                            isValidMaterialCost = true;
                        }

                        if ($scope.quoteDetails.ProcessingCost) {

                            isValidLabourCost = true;
                        }


                        if ($scope.quoteDetails.LabourCost) {

                            isValidProcessingCost = true;
                        }

                        if ($scope.quoteDetails.UnitPrice) {

                            isValidUnitPrice = true;
                        }

                        if (isValidCustomerPn && isValidAnilloPn && isValidMaterialCost && isValidLabourCost && isValidProcessingCost && isValidUnitPrice) {
                            $http({
                                method: 'POST',
                                url: GLOBAL.BASE_URL + "Quote/SaveQuoteDetails",
                                data: $.param(saveObj),
                                headers: {'content-type': 'application/x-www-form-urlencoded'}
                            }).success(function(resp) {

                                if (resp.SaveStatus == true) {
                                    $scope.disableDeleteQuoteConsole();
                                    alert("Saved Successfully");
                                    $scope.refreshDirective();
                                    $scope.totalCost = "$ " + $scope.quoteDetails.TotalCost;
                                    ngDialog.close();
                                }
                                else {
                                    alert("Not Saved Successfully");
                                }
                            });
                        } else {
                            alert('Please Enter Valid Form Data');
                        }



                    }
                };



            });








})(angular);













