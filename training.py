# -*- coding: utf-8 -*-
"""
Spyder Editor

This is a temporary script file.
"""

# -*- coding: utf-8 -*-
"""
Spyder Editor

This is a temporary script file.
"""


import MySQLdb
import operator
import sys
from sklearn import model_selection, preprocessing, linear_model, naive_bayes, metrics, svm
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.feature_selection import SelectKBest
from sklearn.feature_selection import chi2,f_classif
import numpy as np

import pandas as pd

def train_model(classifier, feature_vector_train, label, feature_vector_valid, is_neural_net=False):
    # fit the training dataset on the classifier
    classifier.fit(feature_vector_train, label)
    
    # predict the labels on validation dataset
    predictions = classifier.predict(feature_vector_valid)
    probs = classifier.predict_proba(feature_vector_valid)
    
    if is_neural_net:
        predictions = predictions.argmax(axis=-1)
    
    return probs, predictions

def get_best_features(tfidf_vect, xtrain_tfidf, labels):
        # Create and fit selector
    chi2_selector = SelectKBest(f_classif, k=20)
    chi2_selector.fit(xtrain_tfidf, labels)
    # Get columns to keep
    chi2_scores = pd.DataFrame(list(zip(tfidf_vect.get_feature_names(), chi2_selector.scores_, chi2_selector.pvalues_)), 
                                       columns=['ftr', 'score', 'pval'])

    kbest = np.asarray(tfidf_vect.get_feature_names())[chi2_selector.get_support()]

    return kbest

def train_main(task_id):
    db = MySQLdb.connect("localhost", "root", "", "test", charset='utf8')
    
    cursor = db.cursor()
    
    sql = "SELECT abstract, label FROM articles where taskid=" + str(task_id) + " and label = 1 or label = 3"
    abstracts = []
    labels = []
    try:
       cursor.execute(sql)
       results = cursor.fetchall()
       for row in results:
         abstracts.append(row[0])
         labels.append(row[1])
    except:
       print ("Error: unable to fecth data")
    

    sql2 = "SELECT abstract, artid FROM articles where taskid=" + str(task_id) 
    abstracts_all = []
    ids = []
    try:
        cursor.execute(sql2)
        results_all = cursor.fetchall()
        for arow in results_all:
            abstracts_all.append(arow[0])
            ids.append(arow[1])
    except:
       print ("Error: unable to fecth data")
    
    
    # label encode the target variable
    encoder = preprocessing.LabelEncoder()
    train_y = encoder.fit_transform(labels)
    
    # word level tf-idf
    #tfidf_vect = TfidfVectorizer(stop_words='english', analyzer='word', token_pattern=r'\w{1,}', max_features=1000)
    tfidf_vect = TfidfVectorizer(stop_words='english', analyzer='word', token_pattern=r'\b\w*[a-zA-Z]\w*\b', max_features=1000)
    tfidf_vect.fit(abstracts)
    xtrain_tfidf =  tfidf_vect.transform(abstracts)
    xvalid_tfidf =  tfidf_vect.transform(abstracts_all)

    # get features idf score and print top10
#    idf = tfidf_vect.idf_
#    feature_dict = dict(zip(tfidf_vect.get_feature_names(), idf))
#    sorted_feature_dict = sorted(feature_dict.items(), key=operator.itemgetter(1))
#    top10_features = []
#    count = 0
#    for item in sorted_feature_dict: 
#        if count == 10:
#            break
#        top10_features.append(item[0])
#        count += 1
#        
#    print(top10_features)
    
    # get top10 using sklearn feature selection
    k_best_features = get_best_features(tfidf_vect, xtrain_tfidf, labels)
    print(k_best_features)
    
    #    # ngram level tf-idf 
    #    tfidf_vect_ngram = TfidfVectorizer(analyzer='word', token_pattern=r'\w{1,}', ngram_range=(2,3), max_features=5000)
    #    tfidf_vect_ngram.fit(abstracts)
    #    xtrain_tfidf_ngram =  tfidf_vect_ngram.transform(abstracts)
    #    xvalid_tfidf_ngram =  tfidf_vect_ngram.transform(abstracts_all)
    #    
    #    # characters level tf-idf
    #    tfidf_vect_ngram_chars = TfidfVectorizer(analyzer='char', token_pattern=r'\w{1,}', ngram_range=(2,3), max_features=5000)
    #    tfidf_vect_ngram_chars.fit(abstracts)
    #    xtrain_tfidf_ngram_chars =  tfidf_vect_ngram_chars.transform(abstracts) 
    #    xvalid_tfidf_ngram_chars =  tfidf_vect_ngram_chars.transform(abstracts_all) 
    #    
    # Naive Bayes on Word Level TF IDF Vectors
    probs, predictions = train_model(naive_bayes.MultinomialNB(), xtrain_tfidf, train_y, xvalid_tfidf)   
 
    pred_label = ["Related", "Non-related"]


    for i in range(0, len(ids)):        
        sql_insert = "insert into articles (taskid, artid) value (" + str(task_id) + "," + str(ids[i]) + ")  on duplicate key update score = " + str(probs[i][0]) + ", pred_label = '" + pred_label[predictions[i]] + "', uncert_score = " + str(1-probs[i][0])
        cursor.execute(sql_insert)
 
    db.commit()
    cursor.close()
    db.close()

if __name__ == '__main__':
    task_id = sys.argv[1]
    train_main(task_id)

