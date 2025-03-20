import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Message } from "@/api/entities";
import { Product } from "@/api/entities";
import { useToast } from "@/components/ui/use-toast";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  Send,
  Search,
  ArrowLeft,
  MessageSquare,
  User as UserIcon,
  Package,
  Clock,
  AlertCircle
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function MessagesPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [relatedProduct, setRelatedProduct] = useState(null);
  const { toast } = useToast();

  // טעינת הנתונים הראשונית
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // טעינת המשתמש הנוכחי
        const user = await User.me();
        setCurrentUser(user);

        // בדיקה אם קיימים פרמטרים ב-URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get("product_id");
        const supplierId = urlParams.get("supplier_id");

        // טעינת הפרטים של המוצר אם יש
        if (productId) {
          const products = await Product.list();
          const foundProduct = products.find(p => p.id === productId);
          if (foundProduct) {
            setRelatedProduct(foundProduct);
          }
        }

        // טעינת ההודעות והשיחות
        await loadConversations(user.id);

        // אם קיים ספק וזה מגיע מכרטיס מוצר, פתיחת שיחה איתו
        if (supplierId) {
          const users = await User.list();
          const supplier = users.find(u => u.id === supplierId);
          
          if (supplier) {
            // בדיקה אם יש כבר שיחה קיימת עם הספק
            const existingConversation = conversations.find(
              conv => conv.userId === supplierId || conv.userId === supplierId
            );

            if (existingConversation) {
              setSelectedConversation(existingConversation);
              loadMessages(existingConversation);
            } else {
              // יצירת שיחה חדשה
              const newConversation = {
                userId: supplierId,
                name: supplier.company_name || supplier.full_name,
                avatar: supplier.logo_url,
                lastMessage: "",
                unread: 0,
                timestamp: new Date()
              };
              
              setSelectedConversation(newConversation);
              setConversations(prev => [newConversation, ...prev]);
              setMessages([]);

              // הוספת פרטי המוצר להודעה הראשונה אם קיים
              if (relatedProduct) {
                setNewMessage(`שלום, אני מעוניין במוצר ${relatedProduct.title} (מק"ט: ${relatedProduct.id})`);
              }
            }
          }
        }

      } catch (error) {
        console.error("Error loading initial data:", error);
        toast({
          title: "שגיאה בטעינת נתונים",
          description: "אירעה שגיאה בטעינת הנתונים. אנא נסה שוב מאוחר יותר.",
          variant: "destructive",
        });
      }
      
      setLoading(false);
    };

    loadInitialData();
  }, []);

  // טעינת כל השיחות של המשתמש
  const loadConversations = async (userId) => {
    try {
      // טעינת כל ההודעות של המשתמש
      const allMessages = await Message.list('-created_date');
      
      // מציאת הודעות שנשלחו אל או נשלחו מהמשתמש
      const userMessages = allMessages.filter(
        msg => msg.sender_id === userId || msg.receiver_id === userId
      );
      
      // יצירת רשימת משתמשים ייחודיים שהמשתמש שוחח איתם
      const uniqueUserIds = [...new Set(
        userMessages.flatMap(msg => [
          msg.sender_id === userId ? msg.receiver_id : msg.sender_id
        ])
      )];
      
      // טעינת כל המשתמשים
      const allUsers = await User.list();
      
      // יצירת אובייקטים של שיחות
      const conversationsData = uniqueUserIds.map(contactId => {
        const contactUser = allUsers.find(u => u.id === contactId);
        if (!contactUser) return null;
        
        // מציאת ההודעה האחרונה
        const messagesWithContact = userMessages.filter(
          msg => msg.sender_id === contactId || msg.receiver_id === contactId
        );
        
        const lastMsg = messagesWithContact[0]; // כבר ממוינות לפי תאריך
        
        return {
          userId: contactId,
          name: contactUser.company_name || contactUser.full_name,
          avatar: contactUser.logo_url,
          lastMessage: lastMsg?.content || "",
          unread: messagesWithContact.filter(
            msg => msg.sender_id === contactId && !msg.read
          ).length,
          timestamp: lastMsg?.created_date || new Date()
        };
      }).filter(Boolean);
      
      setConversations(conversationsData);
      
      // אם קיים פרמטר של ספק ב-URL, בחירת השיחה המתאימה
      const urlParams = new URLSearchParams(window.location.search);
      const supplierId = urlParams.get("supplier_id");
      
      if (supplierId) {
        const targetConversation = conversationsData.find(
          conv => conv.userId === supplierId
        );
        
        if (targetConversation) {
          setSelectedConversation(targetConversation);
          loadMessages(targetConversation);
        }
      }
      
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  // טעינת הודעות לשיחה ספציפית
  const loadMessages = async (conversation) => {
    if (!conversation || !currentUser) return;
    
    setLoadingMessages(true);
    
    try {
      const allMessages = await Message.list('created_date');
      const conversationMessages = allMessages.filter(
        msg => 
          (msg.sender_id === currentUser.id && msg.receiver_id === conversation.userId) ||
          (msg.sender_id === conversation.userId && msg.receiver_id === currentUser.id)
      );
      
      setMessages(conversationMessages);
      
      // סימון הודעות כנקראו
      const unreadMessages = conversationMessages.filter(
        msg => msg.sender_id === conversation.userId && !msg.read
      );
      
      if (unreadMessages.length > 0) {
        await Promise.all(
          unreadMessages.map(msg => 
            Message.update(msg.id, { ...msg, read: true })
          )
        );
        
        // עדכון מספר ההודעות שלא נקראו בשיחות
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.userId === conversation.userId
              ? { ...conv, unread: 0 }
              : conv
          )
        );
      }
      
    } catch (error) {
      console.error("Error loading messages:", error);
    }
    
    setLoadingMessages(false);
  };

  // שליחת הודעה חדשה
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;
    
    try {
      // שמירת ההודעה החדשה
      const messageData = {
        sender_id: currentUser.id,
        receiver_id: selectedConversation.userId,
        content: newMessage,
        read: false
      };
      
      // אם קיים מוצר מקושר
      if (relatedProduct) {
        messageData.product_id = relatedProduct.id;
      }
      
      await Message.create(messageData);
      
      // עדכון רשימת ההודעות והשיחות
      setNewMessage("");
      await loadConversations(currentUser.id);
      await loadMessages(selectedConversation);
      
      // עדכון ההודעה האחרונה בשיחה
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.userId === selectedConversation.userId
            ? { 
                ...conv, 
                lastMessage: newMessage,
                timestamp: new Date()
              }
            : conv
        )
      );
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "שגיאה בשליחת הודעה",
        description: "אירעה שגיאה בשליחת ההודעה. אנא נסה שוב.",
        variant: "destructive",
      });
    }
  };

  // סינון שיחות לפי חיפוש
  const filteredConversations = conversations.filter(
    conversation => conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full p-6 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">לא מחובר</h2>
          <p className="text-gray-600 mb-6">עליך להתחבר כדי להשתמש במערכת ההודעות</p>
          <Button onClick={() => User.login()} className="w-full">התחברות</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 h-[75vh]">
        {/* רשימת שיחות */}
        <div className="border-l col-span-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold mb-4">הודעות</h2>
            <div className="relative">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="חיפוש לפי שם..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p>אין שיחות</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.userId}
                  className={`p-3 flex items-center cursor-pointer hover:bg-gray-50 transition-colors border-b ${
                    selectedConversation?.userId === conversation.userId
                      ? "bg-blue-50"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    loadMessages(conversation);
                  }}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 border">
                      {conversation.avatar ? (
                        <AvatarImage src={conversation.avatar} alt={conversation.name} />
                      ) : (
                        <AvatarFallback>
                          {conversation.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    {conversation.unread > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                  <div className="mr-3 flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-medium truncate">{conversation.name}</h3>
                      <span className="text-xs text-gray-500">
                        {format(new Date(conversation.timestamp), "HH:mm")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage || "אין הודעות"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* תצוגת שיחה */}
        <div className="col-span-2 flex flex-col h-full">
          {selectedConversation ? (
            <>
              {/* ראש השיחה */}
              <div className="p-4 border-b flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden ml-2"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                
                <Avatar className="h-10 w-10 ml-3">
                  {selectedConversation.avatar ? (
                    <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.name} />
                  ) : (
                    <AvatarFallback>
                      {selectedConversation.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div>
                  <h3 className="font-medium">{selectedConversation.name}</h3>
                  <span className="text-xs text-gray-500">אונליין</span>
                </div>
              </div>

              {/* מידע על מוצר קשור */}
              {relatedProduct && (
                <div className="p-3 bg-blue-50 flex items-center border-b">
                  <Package className="h-5 w-5 ml-2 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">מוצר מקושר: </span> 
                      {relatedProduct.title}
                    </p>
                  </div>
                </div>
              )}

              {/* גוף השיחה - רשימת הודעות */}
              <div className="flex-1 overflow-y-auto p-4">
                {loadingMessages ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">אין הודעות עדיין</p>
                    <p className="text-sm text-gray-400">שלח הודעה להתחיל שיחה</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isSentByMe = message.sender_id === currentUser.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}
                        >
                          {!isSentByMe && (
                            <Avatar className="h-8 w-8 mt-1 ml-2">
                              {selectedConversation.avatar ? (
                                <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.name} />
                              ) : (
                                <AvatarFallback>
                                  {selectedConversation.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              )}
                            </Avatar>
                          )}
                          <div>
                            <div
                              className={`rounded-lg px-4 py-2 max-w-md break-words ${
                                isSentByMe
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {message.content}
                              
                              {message.product_id && (
                                <div className="flex items-center text-xs mt-1 pt-1 border-t border-white/20">
                                  <Package className="h-3 w-3 ml-1" />
                                  <span>מוצר מקושר</span>
                                </div>
                              )}
                            </div>
                            <div
                              className={`text-xs text-gray-500 mt-1 flex items-center ${
                                isSentByMe ? "justify-end" : ""
                              }`}
                            >
                              <Clock className="h-3 w-3 ml-1" />
                              {format(new Date(message.created_date), "HH:mm dd/MM/yyyy")}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* תיבת שליחת הודעה */}
              <div className="p-3 border-t">
                <div className="flex items-end gap-2">
                  <Textarea
                    placeholder="כתוב הודעה..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 resize-none"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button
                    className="h-10 aspect-square"
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-6">
                <MessageSquare className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">מערכת הודעות</h3>
                <p className="text-gray-500 max-w-md mb-4">
                  בחר שיחה מהרשימה כדי לצפות בהודעות או ליצור קשר עם ספקים דרך דפי המוצרים.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}