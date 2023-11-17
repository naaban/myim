
export const ACTION_NAV_ITEMS: any[] = [
    {
        "title": "general",
        "children": [
            {
                "title": "createParty",
                "path" : "/layout/parties/add-party",
            },
            {
                "title": "createItem"
            }
        ] 
    },
    {
        "title": "createSalesInvoice",
        "children": [
            {
                "title": "quotation"
            },
            {
                "title": "paymentIn"
            },
            {
                "title": "salesReturn"
            },
            {
                "title": "deliveryChallan"
            },
            {
                "title": "proformaInvoice"
            }
        ]
    },
    {
        "title": "createPurchaseTransaction",
        "children": [
            {
                "title": "purchase"
            },
            {
                "title": "paymentOut"
            },
            {
                "title": "purchaseReturn"
            },
            {
                "title": "debitNote"
            },
            {
                "title": "purchaseOrders"
            }
        ]
    },
    {
        "title": "expenses",
        "children": [
            {
                "title": "createExpense"
            }
        ]
    }
]